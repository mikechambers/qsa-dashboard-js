import { gridToLocation } from "../utils/geo";

export default class Spot {
  sequence;
  frequency;
  mode;
  snr;
  time;
  t_tx;
  senderCall;
  senderLocation;
  receiverCall;
  receiverLocator;
  senderDXCC;
  receiverDXCC;
  band;

  constructor({
    sequence, frequency, mode, snr, time, t_tx, senderCall,
    senderLocation, receiverCall, receiverLocator,
    senderDXCC, receiverDXCC, band
  } = {}) {
    Object.assign(this, {
      sequence, frequency, mode, snr, time, t_tx, senderCall,
      senderLocation, receiverCall, receiverLocator,
      senderDXCC, receiverDXCC, band
    });
  }

  static fromData(data) {

    const time = epochToDate(data.t);
    const t_tx = epochToDate(data.tx);

    const senderLocation = gridToLocation(data.sl);
    const receiverLocation = gridToLocation(data.rl);

    //could do distance here

    return new Spot({
      sequence: data.sq,
      frequency: data.f,
      mode: data.md,
      snr: data.rp,
      time: time,
      t_tx: t_tx,
      senderCall: data.sc,
      senderLocation: senderLocation,
      receiverCall: data.rc,
      receiverLocator: receiverLocation,
      senderDXCC: data.sa,
      receiverDXCC: data.ra,
      band: data.b
    });
  }
}
