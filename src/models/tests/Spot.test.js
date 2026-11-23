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
import Spot from "@/models/Spot";
import { Mode } from "@/enums/Mode";

//same shape PSK Reporter sends over MQTT
const message = (overrides = {}) => ({
    sq: 12345,
    t: 1_700_000_100,
    t_tx: 1_700_000_090,
    f: 14_074_500,
    rp: -12,
    md: "FT8",
    b: "20m",
    sc: "W6MSH",
    rc: "K1ABC",
    sl: "CM87",
    rl: "FN42",
    sa: 291,
    ra: 291,
    ...overrides,
});

describe("Spot.fromData", () => {
    it("maps the message fields onto the spot", () => {
        const s = Spot.fromData(message());

        expect(s.id).toBe(12345);
        expect(s.sequence).toBe(12345);
        expect(s.frequency).toBe(14_074_500);
        expect(s.snr).toBe(-12);
        expect(s.senderCall).toBe("W6MSH");
        expect(s.receiverCall).toBe("K1ABC");
        expect(s.mode).toBe(Mode.FT8);
        expect(s.band).toBe("20M");
    });

    it("turns epoch seconds into dates", () => {
        const s = Spot.fromData(message());

        expect(s.receptionDate.getTime()).toBe(1_700_000_100_000);
        expect(s.transmissionDate.getTime()).toBe(1_700_000_090_000);
        expect(s.date).toBe(s.receptionDate);
    });

    it("falls back to the transmission date when there is no reception date", () => {
        const s = Spot.fromData(message({ t: undefined }));
        expect(s.date).toBe(s.transmissionDate);
    });

    it("turns the grids into locations", () => {
        const s = Spot.fromData(message());

        expect(s.senderLocation.grid).toBe("CM87");
        expect(s.receiverLocation.grid).toBe("FN42");
        expect(s.receiverLocation.coordinates).toHaveLength(2);
    });

    it("works out the distance between sender and receiver in km", () => {
        //California Bay Area to New England is roughly 4,300 km
        const s = Spot.fromData(message());
        expect(s.distance).toBeGreaterThan(4000);
        expect(s.distance).toBeLessThan(4700);
    });

    it("looks up the DXCC entity for the receiver", () => {
        const s = Spot.fromData(message());
        expect(s.receiverDXCC).toBeTruthy();
        expect(s.receiverDXCC.countryCode).toBeTruthy();
    });

    it("uses UNKNOWN for a mode it does not know", () => {
        expect(Spot.fromData(message({ md: "WSPR2" })).mode).toBe(Mode.UNKNOWN);
        expect(Spot.fromData(message({ md: undefined })).mode).toBe(
            Mode.UNKNOWN,
        );
    });

    it("leaves the band undefined for a band it does not know", () => {
        expect(Spot.fromData(message({ b: "99m" })).band).toBeUndefined();
    });

    //the MQTT handler catches this and skips the spot, so it has to throw
    it("throws when the receiver grid is missing or invalid", () => {
        expect(() => Spot.fromData(message({ rl: "" }))).toThrow();
        expect(() => Spot.fromData(message({ rl: undefined }))).toThrow();
        expect(() => Spot.fromData(message({ rl: "ZZ99" }))).toThrow();
    });
});
