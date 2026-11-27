// WSJT-X support. protocol.rs converts between bytes and messages, listener.rs
// receives them, passes them on to the web app, and sends replies back.
// A reply can make the radio transmit, so only send one when the user asks.
pub mod listener;
mod protocol;

pub use listener::Connection;
