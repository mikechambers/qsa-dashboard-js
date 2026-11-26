use std::net::UdpSocket;
use std::thread;

use serde::Serialize;
use tauri::{AppHandle, Emitter};

use super::protocol::{self, Message};

// WSJT-X default (Settings > Reporting > UDP Server). Hardcoded for now
const ADDRESS: &str = "127.0.0.1:2237";

// Name of the event the web app listens for
const EVENT: &str = "wsjtx";

#[derive(Clone, Serialize)]
struct Event {
  // address WSJT-X sent from. Replies would go back here
  sender: String,
  // id of the WSJT-X instance
  id: String,
  // flattened, so "type" and its fields sit next to sender and id
  #[serde(flatten)]
  message: Message,
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
