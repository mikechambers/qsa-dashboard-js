/* MIT License
 *
 * Copyright (c) 2026 Mike Chambers
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
        return this.receptionDate ?? this.transmissionDate;
    }

    get id() {
        return this.sequence;
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
