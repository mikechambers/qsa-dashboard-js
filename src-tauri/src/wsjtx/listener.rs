use std::collections::HashMap;
use std::net::{SocketAddr, UdpSocket};
use std::sync::{Mutex, OnceLock};
use std::thread;

use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager, State};

use super::protocol::{self, Message, Reply};

// WSJT-X default (Settings > Reporting > UDP Server). Hardcoded for now
const ADDRESS: &str = "127.0.0.1:2237";

// Name of the event the web app listens for
const EVENT: &str = "wsjtx";

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

// What's needed to send back to WSJT-X. Shared with the commands as app state
#[derive(Default)]
pub struct Connection {
  // the listening socket. Replies must come from it
  socket: OnceLock<UdpSocket>,
  // where each WSJT-X instance (by id) last sent from
  peers: Mutex<HashMap<String, SocketAddr>>,
}

// Called from JavaScript to reply to a CQ. JavaScript only picks the instance,
// so it can't make us send to any other address
#[tauri::command]
pub fn wsjtx_reply(connection: State<Connection>, id: String, decode: Reply) -> Result<(), String> {
  let socket = connection.socket.get().ok_or("Not listening for WSJT-X")?;
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

// Starts listening on a background thread and returns immediately
pub fn start(app: AppHandle) {
  thread::spawn(move || {
    // fails if another program (GridTracker, a logger) already has the port
    let socket = match UdpSocket::bind(ADDRESS) {
      Ok(socket) => socket,
      Err(e) => {
        eprintln!("WSJT-X: could not listen on {ADDRESS}: {e}");
        return;
      }
    };
    println!("WSJT-X: listening on {ADDRESS}");

    let connection = app.state::<Connection>();

    // a second handle on the same socket, for sending replies
    match socket.try_clone() {
      Ok(clone) => {
        let _ = connection.socket.set(clone);
      }
      Err(e) => eprintln!("WSJT-X: replies are unavailable: {e}"),
    }

    // large enough for any UDP packet
    let mut buffer = vec![0u8; 65536];

    loop {
      // blocks this thread (not the app) until a packet arrives
      let (length, sender) = match socket.recv_from(&mut buffer) {
        Ok(received) => received,
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
  });
}
