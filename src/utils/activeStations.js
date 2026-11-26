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

//works out which stations we are hearing right now, and which of them are
//calling us or being worked

import { DecodeKind } from "@/enums/DecodeKind";
import { StationType } from "@/enums/StationType";

//a station in a contact transmits every 30 seconds, so this allows for one
//missed decode before it drops off
export const STATION_EXPIRY_MS = 75_000;

//messages that end a contact, so aren't calling us
const SIGN_OFFS = [DecodeKind.RR73, DecodeKind.SEVENTY_THREE];

//the station WSJT-X is working, from its status
export function getWorkingCall(status) {
    if (!status || !(status.txEnabled || status.transmitting)) return;

    //while calling CQ, the DX call can be left over from the last contact
    if (/^CQ\b/.test(status.txMessage ?? "")) return;

    return status.dxCall || undefined;
}

//decodes must be newest first. Returns { type, decode, callingYou, working }
//for each station heard. If band is set, only stations heard on it are returned
export function getActiveStations(
    decodes,
    { now = Date.now(), band, myCall, workingCall } = {},
) {
    const seen = new Set();
    const active = [];

    for (const decode of decodes) {
        const { call } = decode;

        if (!call || call === myCall || seen.has(call)) continue;
        if (band && decode.band !== band) continue;

        //only the latest thing a station said counts
        seen.add(call);

        //the station being worked stays, even if it fades for a while
        const working = call === workingCall;
        const age = now - decode.receivedAt.getTime();
        if (!working && age > STATION_EXPIRY_MS) continue;

        active.push({
            type:
                decode.kind === DecodeKind.CQ
                    ? StationType.CQ
                    : StationType.HEARD,
            decode,
            callingYou:
                !working &&
                Boolean(myCall) &&
                decode.toCall === myCall &&
                !SIGN_OFFS.includes(decode.kind),
            working,
        });
    }

    return active;
}

//whether we know where a station is. The middle of its country isn't good
//enough to put it on the map
export const isMappable = (decode) =>
    Boolean(decode.location) && decode.locationSource !== "country";

//the stations to show, given the type filter ({ [StationType]: boolean }).
//Stations calling us or being worked are always shown
export const getShownStations = (stations, show) =>
    stations.filter((s) => s.working || s.callingYou || show[s.type]);
