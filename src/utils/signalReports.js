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

//pairs up how a station hears us with how we hear them

//if we don't know one of the bands (no radio connected), assume they match
const sameBand = (a, b) => !a || !b || a === b;

//newest decode matching the test. decodes must be newest first
const find = (decodes, call, band, test = () => true) =>
    decodes.find(
        (d) => d.call === call && sameBand(d.band, band) && test(d),
    );

//how we hear them, from WSJT-X. { snr, date } or undefined
export function getYouHearThem({ call, band, decodes = [] }) {
    const decode = find(decodes, call, band);

    return decode && { snr: decode.snr, date: decode.receivedAt };
}

//how they hear us: the newest of a report they sent us over the air, or a PSK
//Reporter spot. { snr, date, source: "message" | "pskreporter" } or undefined
export function getTheyHearYou({
    call,
    band,
    decodes = [],
    spots = [],
    myCall,
}) {
    const reports = [];

    const decode = find(
        decodes,
        call,
        band,
        (d) => myCall && d.toCall === myCall && d.report !== undefined,
    );

    if (decode) {
        reports.push({
            snr: decode.report,
            date: decode.receivedAt,
            source: "message",
        });
    }

    for (const spot of spots) {
        if (spot.receiverCall === call && sameBand(spot.band, band)) {
            reports.push({
                snr: spot.snr,
                date: spot.date,
                source: "pskreporter",
            });
        }
    }

    return reports.sort((a, b) => b.date - a.date)[0];
}
