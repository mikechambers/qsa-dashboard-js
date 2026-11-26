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

//a station heard by WSJT-X. Unlike a Spot, "call" is the other station and
//we are the receiver. Anything we couldn't work out is undefined.
export default class Decode {
    id;
    date; //time WSJT-X stamped on it
    //when we got it. Use this for how fresh a decode is, as playing back a
    //recording gives decodes with the original time
    receivedAt;
    kind; //DecodeKind
    call; //who transmitted
    toCall;
    cqModifier;
    report; //SNR in the message, for report messages
    text; //message as decoded
    snr; //how well we hear them
    frequency; //Hz
    band;
    mode;
    location;
    //"message", "history" (decoded earlier), "spot" (from PSK Reporter) or
    //"country" (approximate)
    locationSource;
    dxcc;
    distance; //km
    lowConfidence;
    //the original WSJT-X event, needed to send a Reply later
    raw;

    constructor(values = {}) {
        Object.assign(this, values);
    }
}
