use std::io;
use std::net::{Ipv4Addr, SocketAddr, SocketAddrV4, UdpSocket};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread::{self, JoinHandle};
use std::time::{Duration, Instant};

use serde::Serialize;
use socket2::{Domain, Protocol, Socket, Type};
use tauri::{AppHandle, Emitter, Manager, State};

use super::protocol::{self, Message, Reply};

// Name of the event the web app listens for
const EVENT: &str = "wsjtx";

// How often the listening thread stops waiting for a packet to see if it
// should quit
const STOP_CHECK: Duration = Duration::from_millis(250);

// Name of the event for a second WSJT-X being ignored
const IGNORED_EVENT: &str = "wsjtx-ignored";

// At most this often, so a busy second instance doesn't flood the web app
const IGNORED_EVENT_EVERY: Duration = Duration::from_secs(5);

// The WSJT-X we are using is gone after this long without a message. It sends a
// heartbeat every 15 seconds. Keep the same as WSJTX_TIMEOUT_MS in
// src/consts/config.js, which is when the web app shows it as gone
const PEER_TIMEOUT: Duration = Duration::from_secs(40);

// ONLY ONE WSJT-X IS SUPPORTED, AND THIS IS WHERE THAT IS ENFORCED.
//
// The web app keeps one status (band, Tx state, who is being worked) and uses
// it to decide whether Reply is allowed. A Reply can put the radio on the air.
// With two instances, one's status could allow a Reply to the other, or a Reply
// could be sent to the wrong one. So the first one heard is the only one
// listened to, until it says it is closing or goes quiet.
//
// It is identified by its id AND the address and port it sends from, as two
// instances can have the same id ("WSJT-X" unless started with --rig-name).
//
// To support more than one, each would need its own status in the web app,
// and Reply would have to use the status of the one that sent the decode.
//
// This guards against mistakes. UDP senders can be faked, so it is not a
// defense against someone on the network trying to get in the way.
struct Peer {
  id: String,
  // replies are sent here
  address: SocketAddr,
  last_heard: Instant,
}

// What to do with a message
#[derive(Debug, PartialEq)]
enum Sender {
  // the instance in use
  Current,
  // appears to be the one in use, arriving a second way. WSJT-X can send
  // multicast on more than one network interface, which gives the same id and
  // port but another address. Ignored without saying anything
  Duplicate,
  // some other instance. Ignored, and the user is told
  Other,
}

// Takes on the sender if there is no instance in use
fn check_sender(peer: &mut Option<Peer>, id: &str, address: SocketAddr, now: Instant) -> Sender {
  if let Some(current) = peer {
    if now.duration_since(current.last_heard) <= PEER_TIMEOUT {
      if current.id != id {
        return Sender::Other;
      }
      if current.address != address {
        return if current.address.port() == address.port() {
          Sender::Duplicate
        } else {
          // includes WSJT-X restarting without saying it closed, such as after
          // a crash. It is taken on once the old one has timed out
          Sender::Other
        };
      }
    }
  }

  // the instance in use, or a new one
  *peer = Some(Peer {
    id: id.to_string(),
    address,
    last_heard: now,
  });
  Sender::Current
}

// A second instance that is being ignored
#[derive(Clone, Serialize)]
struct Ignored {
  sender: String,
  id: String,
}

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
  // the one WSJT-X instance in use. See Peer
  peer: Mutex<Option<Peer>>,
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
  // start again with whichever instance is heard first
  if let Ok(mut peer) = connection.peer.lock() {
    *peer = None;
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

// Called from JavaScript to reply to a CQ. JavaScript only names the instance,
// which has to be the one in use, so it can't make us send anywhere else
#[tauri::command]
pub fn wsjtx_reply(connection: State<Connection>, id: String, decode: Reply) -> Result<(), String> {
  let current = connection.listener.lock().map_err(|e| e.to_string())?;
  let socket = &current.as_ref().ok_or("Not listening for WSJT-X")?.socket;
  let address = connection
    .peer
    .lock()
    .map_err(|e| e.to_string())?
    .as_ref()
    .filter(|peer| peer.id == id)
    .map(|peer| peer.address)
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

  // when the web app was last told about a second instance
  let mut told_ignored: Option<Instant> = None;

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
      // only one instance is used. Nothing from any other reaches the web app
      let Ok(mut peer) = connection.peer.lock() else {
        continue;
      };
      let now = Instant::now();
      match check_sender(&mut peer, &id, sender, now) {
        Sender::Current => {}
        Sender::Duplicate => continue,
        Sender::Other => {
          if told_ignored.is_none_or(|told| now.duration_since(told) >= IGNORED_EVENT_EVERY) {
            told_ignored = Some(now);
            let ignored = Ignored {
              sender: sender.to_string(),
              id,
            };
            if let Err(e) = app.emit(IGNORED_EVENT, ignored) {
              eprintln!("WSJT-X: could not send event: {e}");
            }
          }
          continue;
        }
      }
      // it is closing, so the next one heard can take over
      if message == Message::Close {
        *peer = None;
      }
      drop(peer);

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

  fn address(last: u8, port: u16) -> SocketAddr {
    SocketAddr::from((Ipv4Addr::new(192, 168, 1, last), port))
  }

  #[test]
  fn only_the_first_instance_is_used() {
    let (mut peer, now) = (None, Instant::now());
    let first = address(10, 5000);

    assert_eq!(check_sender(&mut peer, "WSJT-X", first, now), Sender::Current);
    assert_eq!(check_sender(&mut peer, "WSJT-X", first, now), Sender::Current);

    // the same name from elsewhere, and another name from the same place
    let second = address(20, 6000);
    assert_eq!(check_sender(&mut peer, "WSJT-X", second, now), Sender::Other);
    assert_eq!(check_sender(&mut peer, "WSJT-X - 2", first, now), Sender::Other);

    // replies still go to the first
    assert_eq!(peer.unwrap().address, first);
  }

  #[test]
  fn another_interface_is_a_duplicate() {
    let (mut peer, now) = (None, Instant::now());
    check_sender(&mut peer, "WSJT-X", address(10, 5000), now);

    let other = address(11, 5000);
    assert_eq!(check_sender(&mut peer, "WSJT-X", other, now), Sender::Duplicate);
  }

  #[test]
  fn another_instance_takes_over_once_the_first_is_quiet() {
    let (mut peer, start) = (None, Instant::now());
    check_sender(&mut peer, "WSJT-X", address(10, 5000), start);
    let second = address(10, 6000);

    let at_timeout = start + PEER_TIMEOUT;
    assert_eq!(check_sender(&mut peer, "WSJT-X", second, at_timeout), Sender::Other);

    let after = at_timeout + Duration::from_secs(1);
    assert_eq!(check_sender(&mut peer, "WSJT-X", second, after), Sender::Current);
    assert_eq!(peer.unwrap().address, second);
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
