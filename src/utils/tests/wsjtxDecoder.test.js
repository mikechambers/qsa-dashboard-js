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

import { describe, it, expect, beforeAll } from "vitest";
import {
    applyStatus,
    createDecoder,
    decodeDate,
} from "@/utils/wsjtxDecoder";
import { loadCallsignLookup } from "@/utils/callsignLookup";
import { Band } from "@/enums/Band";

const status = {
    type: "status",
    id: "WSJT-X",
    dialFrequency: 14_074_000,
    mode: "FT8",
    deGrid: "CM87",
};

const decode = (message) => ({
    type: "decode",
    id: "WSJT-X",
    time: 45_000,
    snr: -12,
    deltaFrequency: 1500,
    message,
    lowConfidence: false,
});

describe("createDecoder", () => {
    let lookup;
    beforeAll(async () => {
        lookup = await loadCallsignLookup();
    });

    const setup = () => {
        const decoder = createDecoder();
        decoder.setCallsignLookup(lookup);
        decoder.handle(status);
        return decoder;
    };

    it("fills in details from status and callsign", () => {
        const d = setup().handle(decode("CQ K1ABC FN42"));

        expect(d).toMatchObject({
            call: "K1ABC",
            frequency: 14_075_500,
            band: Band.B20M,
            mode: "FT8",
            locationSource: "message",
        });
        expect(d.dxcc.countryCode).toBeTruthy();
        expect(d.distance).toBeGreaterThan(3500);
        expect(d.distance).toBeLessThan(5000);
        expect(d.raw.message).toBe("CQ K1ABC FN42");
    });

    it("remembers a grid heard earlier", () => {
        const decoder = setup();
        decoder.handle(decode("CQ K1ABC FN42"));
        const d = decoder.handle(decode("W6MSH K1ABC -10"));

        expect(d.locationSource).toBe("history");
        expect(d.location.grid).toBe("FN42");
    });

    it("falls back to the country", () => {
        const d = setup().handle(decode("W6MSH DL2XYZ -10"));

        expect(d.locationSource).toBe("country");
        expect(d.location.longitude).toBeGreaterThan(0);
    });

    it("copes without status or country data", () => {
        const d = createDecoder().handle(decode("CQ K1ABC"));

        expect(d.call).toBe("K1ABC");
        expect(d.band).toBeUndefined();
        expect(d.location).toBeUndefined();
        expect(d.distance).toBeUndefined();
    });
});

describe("applyStatus", () => {
    it("fills in a decode that arrived before the status", () => {
        const early = createDecoder().handle(decode("CQ K1ABC FN42"));
        expect(early.band).toBeUndefined();

        const filled = applyStatus(early, status);
        expect(filled.frequency).toBe(
            status.dialFrequency + early.raw.deltaFrequency,
        );
        expect(filled.band).toBe(Band.B20M);
        expect(filled.distance).toBeGreaterThan(0);
        expect(filled.id).toBe(early.id);
    });

    it("leaves other decodes alone", () => {
        const early = createDecoder().handle(decode("CQ K1ABC FN42"));
        expect(applyStatus(early, { ...status, id: "other" })).toBe(early);

        const filled = applyStatus(early, status);
        expect(applyStatus(filled, { ...status, dialFrequency: 1 })).toBe(
            filled,
        );
    });
});

describe("decodeDate", () => {
    it("uses yesterday for a late decode arriving after midnight", () => {
        const now = new Date("2026-11-26T00:00:05Z");

        expect(decodeDate(86_385_000, now).toISOString()).toBe(
            "2026-11-25T23:59:45.000Z",
        );
    });
});
