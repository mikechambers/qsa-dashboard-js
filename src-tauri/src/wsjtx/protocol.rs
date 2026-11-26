// Reads and writes WSJT-X UDP packets. The format is documented in the WSJT-X source,
// in Network/NetworkMessage.hpp. All numbers are big endian.
//
// New fields are only ever added to the end of a message, so reading the fields
// we know about and ignoring the rest is safe.

use serde::{Deserialize, Serialize};

const MAGIC: u32 = 0xadbccbda;

// Sent to JavaScript as { type: "decode", message: "CQ ...", ... }
#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(
  tag = "type",
  rename_all = "camelCase",
  rename_all_fields = "camelCase"
)]
pub enum Message {
  Heartbeat {
    version: String,
  },
  Status {
    dial_frequency: u64,
    mode: String,
    dx_call: String,
    report: String,
    tx_mode: String,
    tx_enabled: bool,
    transmitting: bool,
    decoding: bool,
    rx_df: u32,
    tx_df: u32,
    de_call: String,
    de_grid: String,
    dx_grid: String,
  },
  Decode {
    is_new: bool,
    // milliseconds since midnight UTC
    time: u32,
    snr: i32,
    delta_time: f64,
    delta_frequency: u32,
    mode: String,
    message: String,
    low_confidence: bool,
    off_air: bool,
  },
  // the Band Activity window was cleared
  Clear,
  // a contact was logged, as an ADIF record
  LoggedAdif {
    adif: String,
  },
  // WSJT-X is shutting down
  Close,
}

// The decode being replied to. WSJT-X looks for a matching line in its Band
// Activity window, so these must be the values it sent us
#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Reply {
  pub time: u32,
  pub snr: i32,
  pub delta_time: f64,
  pub delta_frequency: u32,
  pub mode: String,
  pub message: String,
  pub low_confidence: bool,
}

fn put_string(packet: &mut Vec<u8>, value: &str) {
  packet.extend((value.len() as u32).to_be_bytes());
  packet.extend(value.as_bytes());
}

// Builds a Reply message, which acts like double clicking the decode in WSJT-X.
// It only does this for CQ and QRZ messages
pub fn reply_packet(id: &str, reply: &Reply) -> Vec<u8> {
  let mut packet = Vec::new();
  packet.extend(MAGIC.to_be_bytes());
  packet.extend(2u32.to_be_bytes()); // schema
  packet.extend(4u32.to_be_bytes()); // message type: Reply
  put_string(&mut packet, id);
  packet.extend(reply.time.to_be_bytes());
  packet.extend(reply.snr.to_be_bytes());
  packet.extend(reply.delta_time.to_be_bytes());
  packet.extend(reply.delta_frequency.to_be_bytes());
  put_string(&mut packet, &reply.mode);
  put_string(&mut packet, &reply.message);
  packet.push(u8::from(reply.low_confidence));
  packet.push(0); // keyboard modifiers: none
  packet
}

// Reads values off the front of a packet. Each method returns None if the
// packet is too short.
struct Reader<'a> {
  data: &'a [u8],
}

impl<'a> Reader<'a> {
  fn bytes(&mut self, count: usize) -> Option<&'a [u8]> {
    let (head, tail) = self.data.split_at_checked(count)?;
    self.data = tail;
    Some(head)
  }

  fn array<const N: usize>(&mut self) -> Option<[u8; N]> {
    self.bytes(N)?.try_into().ok()
  }

  fn bool(&mut self) -> Option<bool> {
    Some(self.array::<1>()?[0] != 0)
  }

  fn u32(&mut self) -> Option<u32> {
    self.array().map(u32::from_be_bytes)
  }

  fn i32(&mut self) -> Option<i32> {
    self.array().map(i32::from_be_bytes)
  }

  fn u64(&mut self) -> Option<u64> {
    self.array().map(u64::from_be_bytes)
  }

  fn f64(&mut self) -> Option<f64> {
    self.array().map(f64::from_be_bytes)
  }

  // a length followed by that many bytes of UTF-8
  fn string(&mut self) -> Option<String> {
    let length = self.u32()?;

    // this length means "no string"
    if length == u32::MAX {
      return Some(String::new());
    }

    let bytes = self.bytes(length as usize)?;
    Some(String::from_utf8_lossy(bytes).into_owned())
  }
}

// Returns the WSJT-X instance id and the message
pub fn parse(packet: &[u8]) -> Option<(String, Message)> {
  let mut r = Reader { data: packet };

  if r.u32()? != MAGIC {
    return None;
  }
  let _schema = r.u32()?;
  let message_type = r.u32()?;
  let id = r.string()?;

  // struct fields are read in the order written here, which must match
  // the order in the packet
  let message = match message_type {
    0 => {
      let _max_schema = r.u32()?;
      Message::Heartbeat {
        version: r.string()?,
      }
    }
    1 => Message::Status {
      dial_frequency: r.u64()?,
      mode: r.string()?,
      dx_call: r.string()?,
      report: r.string()?,
      tx_mode: r.string()?,
      tx_enabled: r.bool()?,
      transmitting: r.bool()?,
      decoding: r.bool()?,
      rx_df: r.u32()?,
      tx_df: r.u32()?,
      de_call: r.string()?,
      de_grid: r.string()?,
      dx_grid: r.string()?,
    },
    2 => Message::Decode {
      is_new: r.bool()?,
      time: r.u32()?,
      snr: r.i32()?,
      delta_time: r.f64()?,
      delta_frequency: r.u32()?,
      mode: r.string()?,
      message: r.string()?,
      low_confidence: r.bool()?,
      off_air: r.bool()?,
    },
    3 => Message::Clear,
    6 => Message::Close,
    12 => Message::LoggedAdif { adif: r.string()? },
    _ => return None,
  };

  Some((id, message))
}

#[cfg(test)]
mod tests {
  use super::*;

  fn string(s: &str) -> Vec<u8> {
    [&(s.len() as u32).to_be_bytes()[..], s.as_bytes()].concat()
  }

  fn packet(message_type: u32, body: &[u8]) -> Vec<u8> {
    [
      &MAGIC.to_be_bytes()[..],
      &2u32.to_be_bytes(),
      &message_type.to_be_bytes(),
      &string("WSJT-X"),
      body,
    ]
    .concat()
  }

  fn decode_body() -> Vec<u8> {
    [
      &[1u8][..],
      &45_000u32.to_be_bytes(),
      &(-12i32).to_be_bytes(),
      &0.2f64.to_be_bytes(),
      &1500u32.to_be_bytes(),
      &string("~"),
      &string("CQ K1ABC FN42"),
      &[0, 0],
    ]
    .concat()
  }

  #[test]
  fn parses_a_decode() {
    let (id, message) = parse(&packet(2, &decode_body())).unwrap();

    assert_eq!(id, "WSJT-X");
    assert_eq!(
      message,
      Message::Decode {
        is_new: true,
        time: 45_000,
        snr: -12,
        delta_time: 0.2,
        delta_frequency: 1500,
        mode: "~".into(),
        message: "CQ K1ABC FN42".into(),
        low_confidence: false,
        off_air: false,
      }
    );
  }

  #[test]
  fn builds_a_reply() {
    let reply = Reply {
      time: 45_000,
      snr: -12,
      delta_time: 0.2,
      delta_frequency: 1500,
      mode: "~".into(),
      message: "CQ K1ABC FN42".into(),
      low_confidence: false,
    };

    // a decode without its leading "is new" flag and trailing "off air" flag,
    // followed by low confidence and modifiers
    let body = decode_body();
    let expected = packet(4, &[&body[1..body.len() - 2], &[0, 0]].concat());

    assert_eq!(reply_packet("WSJT-X", &reply), expected);
  }

  #[test]
  fn ignores_bad_and_unknown_packets() {
    let good = packet(2, &decode_body());

    // every possible truncation, none of which should panic
    for length in 0..good.len() {
      assert_eq!(parse(&good[..length]), None);
    }
    assert_eq!(parse(b"not a wsjt-x packet"), None);
    assert_eq!(parse(&packet(99, &[])), None);
  }
}
