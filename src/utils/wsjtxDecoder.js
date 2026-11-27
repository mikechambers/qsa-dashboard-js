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

//step 2: combine parsed messages with what we already know (WSJT-X status,
//grids heard earlier, country data) to make Decode objects

import { distanceOnEarth } from "@ham2k/lib-geo-tools";
import Decode from "@/models/Decode";
import Location from "@/models/Location";
import { Band } from "@/enums/Band";
import { Mode } from "@/enums/Mode";
import { getDXCCEntity, gridToLocation } from "./geo";
import { createGridStore } from "./gridStore";
import { isValidMaidenHeadGrid } from "./radio";
import { parseWsjtxMessage } from "./wsjtxMessage";

const DAY_MS = 24 * 60 * 60 * 1000;

//decodes only carry the time of day (UTC), so pick the date that puts it
//closest to now
export function decodeDate(msSinceMidnight, now = new Date()) {
    const midnight = Math.floor(now.getTime() / DAY_MS) * DAY_MS;
    let time = midnight + msSinceMidnight;

    if (time - now.getTime() > DAY_MS / 2) time -= DAY_MS;
    else if (now.getTime() - time > DAY_MS / 2) time += DAY_MS;

    return new Date(time);
}

const toLocation = (grid) =>
    grid && isValidMaidenHeadGrid(grid) ? gridToLocation(grid) : undefined;

//a decode that arrived before the first status from its WSJT-X is missing what
//comes from the status. Returns a copy with it filled in, or the same decode if
//there is nothing to fill in
export function applyStatus(decode, status) {
    if (decode.frequency !== undefined || decode.raw.id !== status.id) {
        return decode;
    }

    const frequency = status.dialFrequency + decode.raw.deltaFrequency;
    const home = toLocation(status.deGrid);

    return new Decode({
        ...decode,
        frequency,
        band: Band.fromFrequency(frequency),
        mode: Mode.fromData(status.mode),
        distance:
            home && decode.location
                ? distanceOnEarth(home, decode.location)
                : undefined,
    });
}

//lookupCallsign(call) returns { dxccCode, lat, lon } or undefined. It is
//passed in because the country data is large and loaded separately.
//Grids decoded are added to the grid store
export function createDecoder({ grids = createGridStore() } = {}) {
    //only one WSJT-X is supported (see listener.rs), so only the latest status
    //is kept
    let latestStatus;
    let lookupCallsign = () => undefined;
    let sequence = 0;

    return {
        setCallsignLookup(lookup) {
            lookupCallsign = lookup;
        },

        //takes any WSJT-X event. Returns a Decode for decodes, otherwise
        //undefined
        handle(event, now = new Date()) {
            if (event.type === "status") {
                latestStatus = event;
                return;
            }

            if (event.type !== "decode") return;

            //one from before WSJT-X changed doesn't apply
            const status =
                latestStatus?.id === event.id ? latestStatus : undefined;
            const { kind, from, to, cqModifier, grid, report } =
                parseWsjtxMessage(event.message);
            const call = from ?? undefined;

            grids.addHeard(call, grid);

            const info = call ? lookupCallsign(call) : undefined;

            //where this message says they are, otherwise the middle of their
            //country. Grids from elsewhere are filled in later (gridStore)
            let location = toLocation(grid);
            let locationSource = location && "message";

            if (!location && info?.lat !== undefined) {
                location = new Location({
                    latitude: info.lat,
                    longitude: info.lon,
                });
                locationSource = "country";
            }

            //our own grid, as set in WSJT-X
            const home = toLocation(status?.deGrid);

            const frequency = status
                ? status.dialFrequency + event.deltaFrequency
                : undefined;

            sequence += 1;

            return new Decode({
                id: sequence,
                date: decodeDate(event.time, now),
                receivedAt: now,
                kind,
                call,
                toCall: to ?? undefined,
                cqModifier,
                report,
                text: event.message,
                snr: event.snr,
                frequency,
                band: Band.fromFrequency(frequency),
                mode: Mode.fromData(status?.mode),
                location,
                locationSource,
                dxcc: info ? getDXCCEntity(info.dxccCode) : undefined,
                distance:
                    home && location
                        ? distanceOnEarth(home, location)
                        : undefined,
                lowConfidence: event.lowConfidence,
                raw: event,
            });
        },
    };
}
