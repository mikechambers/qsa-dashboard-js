import { distanceOnEarth } from "@ham2k/lib-geo-tools";
import { Band } from "@/enums/Band";
import { Mode } from "@/enums/Mode";
import { getDXCCEntity, gridToLocation } from "@/utils/geo";
import { epochToDate } from "@/utils/date";

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
    receiverLocation;
    senderDXCC;
    receiverDXCC;
    band;
    distance;

    constructor({
        sequence,
        frequency,
        mode,
        snr,
        time,
        t_tx,
        senderCall,
        senderLocation,
        receiverCall,
        receiverLocation,
        senderDXCC,
        receiverDXCC,
        band,
    } = {}) {
        //returns in km
        const distance = distanceOnEarth(senderLocation, receiverLocation);

        Object.assign(this, {
            sequence,
            frequency,
            mode,
            snr,
            time,
            t_tx,
            senderCall,
            senderLocation,
            receiverCall,
            receiverLocation,
            senderDXCC,
            receiverDXCC,
            band,
            distance,
        });
    }

    static fromData(data) {
        const time = epochToDate(data.t);
        const t_tx = epochToDate(data.tx);

        const senderLocation = gridToLocation(data.sl);
        const receiverLocation = gridToLocation(data.rl);

        const senderDXCC = getDXCCEntity(data.sa);
        const receiverDXCC = getDXCCEntity(data.ra);

        const band = Band.fromData(data.b);
        const mode = Mode.fromData(data.md);

        //could do distance here

        return new Spot({
            sequence: data.sq,
            frequency: data.f,
            mode: mode,
            snr: data.rp,
            time: time,
            t_tx: t_tx,
            senderCall: data.sc,
            senderLocation: senderLocation,
            receiverCall: data.rc,
            receiverLocation: receiverLocation,
            senderDXCC: senderDXCC,
            receiverDXCC: receiverDXCC,
            band: band,
        });
    }
}
