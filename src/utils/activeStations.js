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

//works out which stations we have heard, and which of them are calling CQ,
//calling us or being worked right now

import { distanceOnEarth } from "@ham2k/lib-geo-tools";
import { CQ_EXPIRY_MS } from "@/consts/config";
import { DecodeKind } from "@/enums/DecodeKind";
import { StationType } from "@/enums/StationType";
import Decode from "@/models/Decode";

//messages that end a contact, so aren't calling us
const SIGN_OFFS = [DecodeKind.RR73, DecodeKind.SEVENTY_THREE];

//the station WSJT-X is working, from its status
export function getWorkingCall(status) {
    if (!status || !(status.txEnabled || status.transmitting)) return;

    //while calling CQ, the DX call can be left over from the last contact
    if (/^CQ\b/.test(status.txMessage ?? "")) return;

    return status.dxCall || undefined;
}

//a station is kept once for each band it was heard on
const stationId = ({ call, band }) => `${call}|${band ?? ""}`;

//the latest decode of each station on each band, newest first. newer and older
//must be newest first, and everything in newer more recent than older
export function mergeHeard(newer, older, limit) {
    const latest = new Map();

    for (const decode of [...newer, ...older]) {
        if (!decode.call) continue;

        const id = stationId(decode);
        if (!latest.has(id)) latest.set(id, decode);
        if (latest.size >= limit) break;
    }

    return [...latest.values()];
}

//decodes must be newest first. Returns { type, decode, callingYou, working }
//for each station heard on each band. band is the one WSJT-X is on: only a
//station on it can be calling CQ, calling us or being worked. live is false
//once WSJT-X has gone, when none of them can be
export function getActiveStations(
    decodes,
    { now = Date.now(), band, myCall, workingCall, live = true } = {},
) {
    const seen = new Set();
    const stations = [];

    for (const decode of decodes) {
        const { call } = decode;

        if (!call || call === myCall) continue;

        //only the latest thing a station said counts
        const id = stationId(decode);
        if (seen.has(id)) continue;
        seen.add(id);

        const onBand = live && (!band || decode.band === band);
        const recent =
            onBand && now - decode.receivedAt.getTime() <= CQ_EXPIRY_MS;
        const working = onBand && call === workingCall;

        stations.push({
            type:
                recent && decode.kind === DecodeKind.CQ
                    ? StationType.CQ
                    : StationType.HEARD,
            decode,
            callingYou:
                recent &&
                !working &&
                Boolean(myCall) &&
                decode.toCall === myCall &&
                !SIGN_OFFS.includes(decode.kind),
            working,
        });
    }

    return stations;
}

//whether we know where a station is. The middle of its country isn't good
//enough to put it on the map
export const isMappable = (decode) =>
    Boolean(decode.location) && decode.locationSource !== "country";

//the stations to show, given the type filter ({ [StationType]: boolean })
export const getShownStations = (stations, show) =>
    stations.filter((s) => show[s.type]);

//a copy of the decode with its distance measured from home. The decoder uses
//the grid set in WSJT-X, but the app uses the one in its own settings
export const withDistanceFrom = (decode, home) =>
    new Decode({
        ...decode,
        distance:
            home && decode.location
                ? distanceOnEarth(home, decode.location)
                : undefined,
    });
