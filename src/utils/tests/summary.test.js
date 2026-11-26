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
import { getSummary } from "@/utils/summary";

const spot = (call, distance, countryCode) => ({
    call,
    distance,
    countryCode,
    spot: { receiverCall: call, senderCall: "W6MSH" },
});

const station = (call, distance, countryCode, locationSource = "message") => ({
    call,
    distance,
    countryCode,
    approximate: locationSource === "country",
    decode: { location: {}, locationSource },
});

describe("getSummary", () => {
    it("counts stations and countries once, and not our own call", () => {
        const summary = getSummary(
            [
                spot("K1ABC", 100, "us"),
                spot("K1ABC", 100, "us"),
                station("K1ABC", 100, "us"),
                station("F5RXL", 900, "fr"),
            ],
            "w6msh",
        );

        expect(summary.stationCount).toBe(2);
        expect(summary.countryCount).toBe(2);
    });

    it("takes the first row as the most recent", () => {
        const rows = [station("F5RXL", 900, "fr"), spot("K1ABC", 100, "us")];
        expect(getSummary(rows).mostRecent).toBe(rows[0]);
    });

    it("skips rough and unknown distances for the furthest", () => {
        const summary = getSummary([
            station("VK1ABC", 12000, "au", "country"),
            station("N0CALL", undefined),
            station("F5RXL", 900, "fr"),
            spot("K1ABC", 100, "us"),
        ]);

        expect(summary.furthest.call).toBe("F5RXL");
    });

    it("is empty with no rows", () => {
        expect(getSummary([])).toEqual({
            furthest: undefined,
            mostRecent: undefined,
            stationCount: 0,
            countryCount: 0,
        });
    });
});
