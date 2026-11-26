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

const Bands = {
    B2200M: "2200M",
    B630M: "630M",
    B160M: "160M",
    B80M: "80M",
    B60M: "60M",
    B40M: "40M",
    B30M: "30M",
    B20M: "20M",
    B17M: "17M",
    B15M: "15M",
    B12M: "12M",
    B10M: "10M",
    B6M: "6M",
    B4M: "4M",
    B2M: "2M",
    B125M: "125M",
    B70CM: "70CM",
    B33CM: "33CM",
    B23CM: "23CM",
};

//band edges in Hz, using the widest allocation of any region
const BAND_RANGES = [
    [135_700, 137_800, Bands.B2200M],
    [472_000, 479_000, Bands.B630M],
    [1_800_000, 2_000_000, Bands.B160M],
    [3_500_000, 4_000_000, Bands.B80M],
    [5_060_000, 5_450_000, Bands.B60M],
    [7_000_000, 7_300_000, Bands.B40M],
    [10_100_000, 10_150_000, Bands.B30M],
    [14_000_000, 14_350_000, Bands.B20M],
    [18_068_000, 18_168_000, Bands.B17M],
    [21_000_000, 21_450_000, Bands.B15M],
    [24_890_000, 24_990_000, Bands.B12M],
    [28_000_000, 29_700_000, Bands.B10M],
    [50_000_000, 54_000_000, Bands.B6M],
    [70_000_000, 71_000_000, Bands.B4M],
    [144_000_000, 148_000_000, Bands.B2M],
    [222_000_000, 225_000_000, Bands.B125M],
    [420_000_000, 450_000_000, Bands.B70CM],
    [902_000_000, 928_000_000, Bands.B33CM],
    [1_240_000_000, 1_300_000_000, Bands.B23CM],
];

export const Band = Object.freeze({
    ...Bands,

    get cases() {
        return Object.values(Bands);
    },

    fromFrequency: (hz) =>
        BAND_RANGES.find(([low, high]) => hz >= low && hz <= high)?.[2],

    fromData: (v) => {
        if (!v) {
            return undefined;
        }

        const upper = v.toUpperCase();
        return Object.values(Bands).find((v) => v === upper);
    },
});
