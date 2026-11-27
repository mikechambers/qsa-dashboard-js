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
import { SpotFilter, SpotFilterDefaults } from "@/models/SpotFilter";
import { ALL_CASES } from "@/consts";
import { MIN_SNR } from "@/consts/config";

//the filter only reads these fields, so plain objects are enough
const spot = (overrides = {}) => ({
    receiverCall: "K1ABC",
    band: "20M",
    mode: "FT8",
    snr: -10,
    distance: 1000,
    ...overrides,
});

describe("SpotFilter defaults", () => {
    it("has no active filter", () => {
        expect(new SpotFilter().hasFilter()).toBe(false);
    });

    it("lets a normal spot through", () => {
        expect(new SpotFilter().filter([spot()])).toHaveLength(1);
    });

    it("hides spots weaker than the minimum SNR, even with no filter set", () => {
        const spots = [spot({ snr: MIN_SNR }), spot({ snr: MIN_SNR - 1 })];
        expect(new SpotFilter().filter(spots)).toHaveLength(1);
    });
});

describe("SpotFilter.with", () => {
    it("returns a new filter and leaves the original alone", () => {
        const a = new SpotFilter();
        const b = a.with({ band: "40M" });

        expect(b).not.toBe(a);
        expect(b).toBeInstanceOf(SpotFilter);
        expect(a.band).toBe(ALL_CASES);
        expect(b.band).toBe("40M");
    });
});

describe("SpotFilter.hasFilter", () => {
    it.each([
        ["callsign", { callsign: "K1" }],
        ["band", { band: "20M" }],
        ["mode", { mode: "FT8" }],
        ["snr", { snr: -5 }],
        ["distance", { distance: 100 }],
        ["skipDuplicates", { skipDuplicates: true }],
    ])("is true when %s is changed", (_name, change) => {
        expect(new SpotFilter().with(change).hasFilter()).toBe(true);
    });

    it("is false again once values go back to the defaults", () => {
        const f = new SpotFilter()
            .with({ band: "20M" })
            .with({ band: SpotFilterDefaults.BAND });
        expect(f.hasFilter()).toBe(false);
    });
});

describe("SpotFilter.filter", () => {
    it("matches the receiver callsign by prefix, ignoring case", () => {
        const spots = [
            spot({ receiverCall: "K1ABC" }),
            spot({ receiverCall: "K2XYZ" }),
            spot({ receiverCall: "W1AW" }),
        ];
        const result = new SpotFilter().with({ callsign: "k1" }).filter(spots);
        expect(result.map((s) => s.receiverCall)).toEqual(["K1ABC"]);
    });

    it("does not match a callsign in the middle", () => {
        const result = new SpotFilter()
            .with({ callsign: "ABC" })
            .filter([spot({ receiverCall: "K1ABC" })]);
        expect(result).toHaveLength(0);
    });

    it("handles a spot with no receiver callsign", () => {
        const result = new SpotFilter()
            .with({ callsign: "K1" })
            .filter([spot({ receiverCall: undefined })]);
        expect(result).toHaveLength(0);
    });

    it("filters by band", () => {
        const spots = [spot({ band: "20M" }), spot({ band: "40M" })];
        const result = new SpotFilter().with({ band: "40M" }).filter(spots);
        expect(result.map((s) => s.band)).toEqual(["40M"]);
    });

    it("filters by mode", () => {
        const spots = [spot({ mode: "FT8" }), spot({ mode: "CW" })];
        const result = new SpotFilter().with({ mode: "CW" }).filter(spots);
        expect(result.map((s) => s.mode)).toEqual(["CW"]);
    });

    it("keeps spots at exactly the minimum SNR and drops weaker ones", () => {
        const spots = [spot({ snr: -5 }), spot({ snr: -6 }), spot({ snr: 3 })];
        const result = new SpotFilter().with({ snr: -5 }).filter(spots);
        expect(result.map((s) => s.snr)).toEqual([-5, 3]);
    });

    it("keeps spots at exactly the minimum distance and drops closer ones", () => {
        const spots = [
            spot({ distance: 99 }),
            spot({ distance: 100 }),
            spot({ distance: 5000 }),
        ];
        const result = new SpotFilter().with({ distance: 100 }).filter(spots);
        expect(result.map((s) => s.distance)).toEqual([100, 5000]);
    });

    it("combines filters", () => {
        const spots = [
            spot({ band: "20M", snr: -2 }),
            spot({ band: "20M", snr: -20 }),
            spot({ band: "40M", snr: -2 }),
        ];
        const result = new SpotFilter()
            .with({ band: "20M", snr: -10 })
            .filter(spots);
        expect(result).toHaveLength(1);
    });

    it("keeps only the first spot per receiver, band and mode when skipping duplicates", () => {
        //spots are newest first, so the newest one wins
        const spots = [
            spot({ receiverCall: "K1ABC", snr: -1 }),
            spot({ receiverCall: "K1ABC", snr: -9 }),
            spot({ receiverCall: "K1ABC", band: "40M", snr: -3 }),
            spot({ receiverCall: "K1ABC", mode: "FT4", snr: -4 }),
            spot({ receiverCall: "K2XYZ", snr: -5 }),
        ];
        const result = new SpotFilter()
            .with({ skipDuplicates: true })
            .filter(spots);
        expect(result.map((s) => s.snr)).toEqual([-1, -3, -4, -5]);
    });

    it("does not carry duplicate tracking between calls", () => {
        const f = new SpotFilter().with({ skipDuplicates: true });
        expect(f.filter([spot()])).toHaveLength(1);
        expect(f.filter([spot()])).toHaveLength(1);
    });

    it("returns a new array and does not change the input", () => {
        const spots = [spot(), spot({ snr: -50 })];
        const result = new SpotFilter().filter(spots);
        expect(spots).toHaveLength(2);
        expect(result).not.toBe(spots);
    });
});

describe("SpotFilter age and stations", () => {
    const NOW = Date.UTC(2026, 0, 1, 12, 0, 0);
    const minutesAgo = (m) => new Date(NOW - m * 60_000);
    const station = (values) => ({
        decode: {
            call: "K1ABC",
            band: "20M",
            mode: "FT8",
            snr: -10,
            receivedAt: minutesAgo(1),
            ...values,
        },
    });

    it("filters spots and stations by age", () => {
        const filter = new SpotFilter().with({ age: 5 });
        const spots = [{ date: minutesAgo(4) }, { date: minutesAgo(6) }];
        const stations = [station(), station({ receivedAt: minutesAgo(6) })];

        expect(filter.filter(spots, NOW)).toEqual([spots[0]]);
        expect(filter.filterStations(stations, NOW)).toEqual([stations[0]]);
        expect(filter.hasFilter()).toBe(true);
    });

    it("applies the other filters to stations", () => {
        const stations = [
            station(),
            station({ call: "DL2XYZ" }),
            station({ band: "40M" }),
            station({ snr: -20 }),
        ];
        const filter = new SpotFilter().with({
            callsign: "k1",
            band: "20M",
            snr: -15,
        });

        expect(filter.filterStations(stations, NOW)).toEqual([stations[0]]);
    });
});
