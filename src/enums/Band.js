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

export const Band = Object.freeze({
    ...Bands,

    get cases() {
        return Object.values(Bands);
    },

    fromData: (v) => {
        if (!v) {
            return undefined;
        }

        const upper = v.toUpperCase();
        return Object.values(Bands).find((v) => v === upper);
    },
});
