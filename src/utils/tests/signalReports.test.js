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
import { getTheyHearYou, getYouHearThem } from "../signalReports";

const at = (seconds) => new Date(Date.UTC(2026, 0, 1, 12, 0, seconds));

const spot = {
    receiverCall: "K1ABC",
    band: "20M",
    snr: -14,
    date: at(0),
};

const reply = {
    call: "K1ABC",
    toCall: "W6MSH",
    band: "20M",
    snr: -2,
    report: -7,
    receivedAt: at(30),
};

const query = { call: "K1ABC", band: "20M", myCall: "W6MSH" };

describe("signal reports", () => {
    it("uses a PSK Reporter spot", () => {
        expect(getTheyHearYou({ ...query, spots: [spot] })).toMatchObject({
            snr: -14,
            source: "pskreporter",
        });
    });

    it("prefers whichever report is newer", () => {
        const found = getTheyHearYou({
            ...query,
            spots: [spot],
            decodes: [reply],
        });

        expect(found).toMatchObject({ snr: -7, source: "message" });
    });

    it("does not pair readings from different bands", () => {
        const other = { ...query, band: "40M", spots: [spot] };

        expect(getTheyHearYou(other)).toBeUndefined();
    });

    it("pairs them when the band is unknown", () => {
        const found = getTheyHearYou({
            ...query,
            band: undefined,
            spots: [spot],
        });

        expect(found.snr).toBe(-14);
    });

    it("finds how we hear them", () => {
        expect(getYouHearThem({ ...query, decodes: [reply] }).snr).toBe(-2);
        expect(getYouHearThem({ ...query, decodes: [] })).toBeUndefined();
    });
});
