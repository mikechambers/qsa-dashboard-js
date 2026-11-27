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

import { describe, expect, it } from "vitest";
import { getBandNoun, getBandStats, pickBands } from "../bandStats";
import { StationType } from "@/enums/StationType";

const row = (band, distance = 0, type = StationType.SPOT) => ({
    band,
    distance,
    type,
    date: new Date(),
    snr: -10,
});

describe("getBandStats", () => {
    it("counts rows per band, most first, with the furthest distance", () => {
        const stats = getBandStats([
            row("10M", 5),
            row("20M", 100),
            row("20M", 300),
        ]);

        expect(stats.map((s) => [s.band, s.count, s.furthest])).toEqual([
            ["20M", 2, 300],
            ["10M", 1, 5],
        ]);
    });
});

describe("getBandNoun", () => {
    it("depends on what is counted", () => {
        expect(getBandNoun({ count: 2, spots: 2 })).toBe("spots");
        expect(getBandNoun({ count: 2, spots: 0 })).toBe("stations");
        expect(getBandNoun({ count: 2, spots: 1 })).toBe("entries");
    });
});

describe("pickBands", () => {
    const bands = ["20M", "17M", "10M"].map((band) => ({ band }));
    const names = (list) => list.map((b) => b.band);

    it("takes the first ones", () => {
        expect(names(pickBands(bands, 2, null))).toEqual(["20M", "17M"]);
    });

    it("keeps the selected band in view", () => {
        expect(names(pickBands(bands, 2, "10M"))).toEqual(["20M", "10M"]);
    });
});
