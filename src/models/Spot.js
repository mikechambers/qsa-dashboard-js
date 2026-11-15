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
    receptionDate;
    transmissionDate;
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
        receptionDate,
        transmissionDate,
        senderCall,
        senderLocation,
        receiverCall,
        receiverLocation,
        senderDXCC,
        receiverDXCC,
        band,
        distance,
    } = {}) {
        //returns in km
        if (!distance) {
            distance = distanceOnEarth(senderLocation, receiverLocation);
        }

        Object.assign(this, {
            sequence,
            frequency,
            mode,
            snr,
            receptionDate,
            transmissionDate,
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

    get date() {
        return this.transmissionDate ?? this.receptionDate;
    }

    static fromData(data) {
        const receptionDate = epochToDate(data.t);
        const transmissionDate = epochToDate(data.t_tx);

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
            receptionDate: receptionDate,
            transmissionDate: transmissionDate,
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
