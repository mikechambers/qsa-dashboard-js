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

import { describe, it, expect } from "vitest";
import { buildBuckets } from "../useSpotIntervalData";

const MINUTE = 60 * 1000;

//30 seconds into a minute, so "now" is not on a boundary
const MINUTE_START = Math.floor(Date.UTC(2026, 10, 23, 12, 30) / MINUTE) * MINUTE;
const NOW = MINUTE_START + 30_000;

//a spot that arrived minutesAgo whole minutes before the current minute
const spot = (minutesAgo, snr = -10, distance = 1000, seconds = 10) => ({
    date: new Date(MINUTE_START - minutesAgo * MINUTE + seconds * 1000),
    snr,
    distance,
});

describe("buildBuckets", () => {
    it("always returns 30 slots, empty ones are null", () => {
        const b = buildBuckets([], NOW);
        expect(b).toHaveLength(30);
        expect(b.every((x) => x === null)).toBe(true);
    });

    it("puts a spot from the current minute in the last slot", () => {
        const b = buildBuckets([spot(0)], NOW);
        expect(b[29].count).toBe(1);
        expect(b.slice(0, 29).every((x) => x === null)).toBe(true);
    });

    it("puts a spot from 29 minutes ago in the first slot", () => {
        const b = buildBuckets([spot(29)], NOW);
        expect(b[0].count).toBe(1);
    });

    it("drops spots older than 30 minutes", () => {
        const justTooOld = {
            date: new Date(MINUTE_START - 29 * MINUTE - 1),
            snr: 0,
            distance: 1,
        };
        const b = buildBuckets([spot(30), spot(60), justTooOld], NOW);
        expect(b.every((x) => x === null)).toBe(true);
    });

    it("drops spots from the future", () => {
        const future = {
            date: new Date(MINUTE_START + MINUTE),
            snr: 0,
            distance: 1,
        };
        expect(buildBuckets([future], NOW).every((x) => x === null)).toBe(true);
    });

    it("counts spots and averages SNR within a minute", () => {
        const b = buildBuckets(
            [spot(3, -10, 500), spot(3, -20, 1500, 40), spot(3, 0, 1000, 50)],
            NOW,
        );
        const slot = b[26];
        expect(slot.count).toBe(3);
        expect(slot.avgSnr).toBeCloseTo(-10);
    });

    it("reports the furthest distance and the SNR of that spot", () => {
        const b = buildBuckets(
            [spot(1, -5, 800), spot(1, -22, 9000), spot(1, 2, 300)],
            NOW,
        );
        expect(b[28].maxKm).toBe(9000);
        expect(b[28].maxSnr).toBe(-22);
    });

    it("works out the median distance for an odd number of spots", () => {
        const b = buildBuckets(
            [spot(0, -1, 100), spot(0, -1, 900), spot(0, -1, 300)],
            NOW,
        );
        expect(b[29].medKm).toBe(300);
    });

    it("works out the median distance for an even number of spots", () => {
        const b = buildBuckets(
            [spot(0, -1, 100), spot(0, -1, 200), spot(0, -1, 300), spot(0, -1, 900)],
            NOW,
        );
        expect(b[29].medKm).toBe(250);
    });

    it("keeps minutes separate", () => {
        const b = buildBuckets([spot(0), spot(1), spot(1)], NOW);
        expect(b[29].count).toBe(1);
        expect(b[28].count).toBe(2);
    });
});
