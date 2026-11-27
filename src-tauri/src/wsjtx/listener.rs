use std::collections::HashMap;
use std::io;
use std::net::{Ipv4Addr, SocketAddr, SocketAddrV4, UdpSocket};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread::{self, JoinHandle};
use std::time::Duration;

use serde::Serialize;
use socket2::{Domain, Protocol, Socket, Type};
use tauri::{AppHandle, Emitter, Manager, State};

use super::protocol::{self, Message, Reply};

// Name of the event the web app listens for
const EVENT: &str = "wsjtx";

// How often the listening thread stops waiting for a packet to see if it
// should quit
const STOP_CHECK: Duration = Duration::from_millis(250);

#[derive(Clone, Serialize)]
struct Event {
  // address WSJT-X sent from
  sender: String,
  // id of the WSJT-X instance
  id: String,
  // flattened, so "type" and its fields sit next to sender and id
  #[serde(flatten)]
  message: Message,
}

// The running listener, if there is one
struct Listener {
  // a second handle on the listening socket. Replies must come from it
  socket: UdpSocket,
  stop: Arc<AtomicBool>,
  thread: JoinHandle<()>,
}

// Shared with the commands as app state
#[derive(Default)]
pub struct Connection {
  listener: Mutex<Option<Listener>>,
  // where each WSJT-X instance (by id) last sent from
  peers: Mutex<HashMap<String, SocketAddr>>,
}

// Why we aren't listening, for the web app to explain
#[derive(Debug, Serialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum ListenError {
  InvalidAddress,
  // another program has the port
  InUse,
  // a direct address has to be one of this computer's own
  NotLocal,
  Other { message: String },
}

impl From<io::Error> for ListenError {
  fn from(error: io::Error) -> Self {
    match error.kind() {
      io::ErrorKind::AddrInUse => ListenError::InUse,
      io::ErrorKind::AddrNotAvailable => ListenError::NotLocal,
      _ => ListenError::Other {
        message: error.to_string(),
      },
    }
  }
}

// Stops listening if we are, then starts again with these settings if enabled.
// The web app owns the settings, so it calls this at startup and on changes.
// async so that waiting for the old thread doesn't block the window
#[tauri::command(async)]
pub fn wsjtx_configure(
  app: AppHandle,
  connection: State<Connection>,
  enabled: bool,
  address: String,
  port: u16,
) -> Result<(), ListenError> {
  // held throughout, so that two calls can't overlap
  let mut current = connection.listener.lock().map_err(|e| ListenError::Other {
    message: e.to_string(),
  })?;

  if let Some(listener) = current.take() {
    listener.stop.store(true, Ordering::Relaxed);
    // the port is only free once the thread has dropped its socket
    let _ = listener.thread.join();
  }
  if let Ok(mut peers) = connection.peers.lock() {
    peers.clear();
  }

  if !enabled {
    println!("WSJT-X: not listening (turned off)");
    return Ok(());
  }

  let address: Ipv4Addr = address
    .trim()
    .parse()
    .map_err(|_| ListenError::InvalidAddress)?;

  *current = Some(start(app, address, port).inspect_err(|e| {
    eprintln!("WSJT-X: could not listen on {address}:{port}: {e:?}");
  })?);
  println!("WSJT-X: listening on {address}:{port}");

  Ok(())
}

// A multicast address means joining that group, which several programs can do
// at once. Any other address is listened on directly, by us alone
fn open_socket(address: Ipv4Addr, port: u16) -> io::Result<UdpSocket> {
  if !address.is_multicast() {
    return UdpSocket::bind((address, port));
  }

  let socket = Socket::new(Domain::IPV4, Type::DGRAM, Some(Protocol::UDP))?;
  // let the other programs use the same port
  socket.set_reuse_address(true)?;
  #[cfg(unix)]
  socket.set_reuse_port(true)?;
  socket.bind(&SocketAddr::from(SocketAddrV4::new(Ipv4Addr::UNSPECIFIED, port)).into())?;

  // join on loopback (WSJT-X on this computer) and on the default network
  // interface (WSJT-X elsewhere). Either one is enough
  let loopback = socket.join_multicast_v4(&address, &Ipv4Addr::LOCALHOST);
  let network = socket.join_multicast_v4(&address, &Ipv4Addr::UNSPECIFIED);
  if loopback.is_err() {
    network?;
  }

  Ok(socket.into())
}

// Called from JavaScript to reply to a CQ. JavaScript only picks the instance,
// so it can't make us send to any other address
#[tauri::command]
pub fn wsjtx_reply(connection: State<Connection>, id: String, decode: Reply) -> Result<(), String> {
  let current = connection.listener.lock().map_err(|e| e.to_string())?;
  let socket = &current.as_ref().ok_or("Not listening for WSJT-X")?.socket;
  let address = connection
    .peers
    .lock()
    .map_err(|e| e.to_string())?
    .get(&id)
    .copied()
    .ok_or("WSJT-X has not been heard from")?;

  socket
    .send_to(&protocol::reply_packet(&id, &decode), address)
    .map_err(|e| e.to_string())?;

  println!("WSJT-X: sent reply to \"{}\"", decode.message);
  Ok(())
}

// Opens the socket, then receives on a background thread until told to stop
fn start(app: AppHandle, address: Ipv4Addr, port: u16) -> Result<Listener, ListenError> {
  let socket = open_socket(address, port)?;
  socket.set_read_timeout(Some(STOP_CHECK))?;
  let replies = socket.try_clone()?;

  let stop = Arc::new(AtomicBool::new(false));
  let thread = thread::spawn({
    let stop = stop.clone();
    move || receive(app, socket, &stop)
  });

  Ok(Listener {
    socket: replies,
    stop,
    thread,
  })
}

fn receive(app: AppHandle, socket: UdpSocket, stop: &AtomicBool) {
  let connection = app.state::<Connection>();

  // large enough for any UDP packet
  let mut buffer = vec![0u8; 65536];

  while !stop.load(Ordering::Relaxed) {
    // blocks this thread (not the app) until a packet arrives or the read
    // times out
    let (length, sender) = match socket.recv_from(&mut buffer) {
      Ok(received) => received,
      // nothing arrived. Which kind of error that is depends on the platform
      Err(e)
        if matches!(
          e.kind(),
          io::ErrorKind::WouldBlock | io::ErrorKind::TimedOut
        ) =>
      {
        continue;
      }
      Err(e) => {
        eprintln!("WSJT-X: receive error: {e}");
        continue;
      }
    };

    // None means it isn't a WSJT-X message, or a type we don't handle
    if let Some((id, message)) = protocol::parse(&buffer[..length]) {
      // remember where to send replies
      if let Ok(mut peers) = connection.peers.lock() {
        peers.insert(id.clone(), sender);
      }

      let event = Event {
        sender: sender.to_string(),
        id,
        message,
      };

      if let Err(e) = app.emit(EVENT, event) {
        eprintln!("WSJT-X: could not send event: {e}");
      }
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  const GROUP: Ipv4Addr = Ipv4Addr::new(224, 0, 0, 1);

  // a port nothing is using right now
  fn free_port() -> u16 {
    let socket = UdpSocket::bind((Ipv4Addr::LOCALHOST, 0)).unwrap();
    socket.local_addr().unwrap().port()
  }

  #[test]
  fn a_direct_port_is_ours_alone() {
    let port = free_port();
    let _first = open_socket(Ipv4Addr::LOCALHOST, port).unwrap();

    let error = open_socket(Ipv4Addr::LOCALHOST, port).unwrap_err();
    assert!(matches!(ListenError::from(error), ListenError::InUse));
  }

  #[test]
  fn a_multicast_port_can_be_shared() {
    let port = free_port();
    let _first = open_socket(GROUP, port).unwrap();

    assert!(open_socket(GROUP, port).is_ok());
  }

  #[test]
  fn a_direct_address_must_be_ours() {
    // reserved for documentation, so never this computer's
    let error = open_socket(Ipv4Addr::new(192, 0, 2, 1), free_port()).unwrap_err();
    assert!(matches!(ListenError::from(error), ListenError::NotLocal));
  }
}
