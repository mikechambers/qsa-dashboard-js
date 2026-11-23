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

const Modes = {
    FT8: "FT8",
    FT4: "FT4",
    JS8: "JS8",
    CW: "CW",
    MFSK: "MFSK",
    JT9: "JT9",
    JT65: "JT65",
    PSK31: "PSK31",
    PSK63: "PSK63",
    RTTY: "RTTY",
    SSB: "SSB",
    OLIVIA: "OLIVIA",
    UNKNOWN: "UNKNOWN",
};

export const Mode = Object.freeze({
    ...Modes,

    get cases() {
        return Object.values(Modes);
    },

    fromData: (v) => {
        if (!v) {
            return Modes.UNKNOWN;
        }

        const upper = v.toUpperCase();
        return Object.values(Modes).find((m) => m === upper) ?? Modes.UNKNOWN;
    },
});
