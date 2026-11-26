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

//works out which stations are calling right now, either CQ or us

import { DecodeKind } from "@/enums/DecodeKind";
import { StationType } from "@/enums/StationType";

//a calling station transmits every 30 seconds, so this allows for one missed
//decode before it drops off
export const STATION_EXPIRY_MS = 75_000;

const getType = (decode, myCall) => {
    if (decode.kind === DecodeKind.CQ) return StationType.CQ;
    if (myCall && decode.toCall === myCall) return StationType.RESPONSE;
};

//decodes must be newest first. Returns { type, decode } for each station still
//calling CQ or calling myCall. If band is set, only stations heard on it are
//returned
export function getActiveStations(
    decodes,
    { now = Date.now(), band, myCall } = {},
) {
    const seen = new Set();
    const active = [];

    for (const decode of decodes) {
        const { call } = decode;

        if (!call || seen.has(call)) continue;
        if (band && decode.band !== band) continue;

        //only the latest thing a station said counts. If they have moved on
        //to working someone else, they drop off
        seen.add(call);

        const type = getType(decode, myCall);
        if (!type) continue;
        if (now - decode.receivedAt.getTime() > STATION_EXPIRY_MS) continue;

        active.push({ type, decode });
    }

    return active;
}

//stations we can put on the map. The middle of a country isn't where they are,
//so those are left off
export const isMappable = (decode) =>
    Boolean(decode.location) && decode.locationSource !== "country";
