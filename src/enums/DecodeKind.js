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

//what a decoded WSJT-X message is
const DecodeKinds = {
    CQ: "CQ", //CQ K1ABC FN42
    GRID: "GRID", //W6MSH K1ABC FN42
    REPORT: "REPORT", //W6MSH K1ABC -12
    ROGER_REPORT: "ROGER_REPORT", //W6MSH K1ABC R-12
    RRR: "RRR",
    RR73: "RR73",
    SEVENTY_THREE: "73",
    CALL: "CALL", //two callsigns and nothing else
    UNKNOWN: "UNKNOWN", //free text, contest and Fox / Hound formats
};

export const DecodeKind = Object.freeze({
    ...DecodeKinds,
});
