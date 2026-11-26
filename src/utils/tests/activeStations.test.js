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
import {
    STATION_EXPIRY_MS,
    getActiveStations,
    isMappable,
} from "../activeStations";
import { DecodeKind } from "@/enums/DecodeKind";
import { StationType } from "@/enums/StationType";

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0);

const decode = (values) => ({
    call: "K1ABC",
    kind: DecodeKind.CQ,
    band: "20M",
    receivedAt: new Date(NOW),
    ...values,
});

const calls = (decodes, options) =>
    getActiveStations(decodes, { now: NOW, ...options }).map(
        (s) => s.decode,
    );

describe("getActiveStations", () => {
    it("returns each station once, using its newest decode", () => {
        const decodes = [decode({ snr: -5 }), decode({ snr: -12 })];

        expect(calls(decodes)).toEqual([decodes[0]]);
    });

    it("tells CQs from stations calling us", () => {
        const decodes = [
            decode(),
            decode({
                call: "DL2XYZ",
                kind: DecodeKind.REPORT,
                toCall: "W6MSH",
            }),
        ];
        const types = getActiveStations(decodes, {
            now: NOW,
            myCall: "W6MSH",
        }).map((s) => s.type);

        expect(types).toEqual([StationType.CQ, StationType.RESPONSE]);
    });

    it("drops a station that has since started working someone else", () => {
        const decodes = [
            decode({ kind: DecodeKind.REPORT, toCall: "N1XYZ" }),
            decode(),
        ];

        expect(calls(decodes, { myCall: "W6MSH" })).toEqual([]);
    });

    it("expires old calls", () => {
        const decodes = [
            decode({ receivedAt: new Date(NOW - STATION_EXPIRY_MS - 1) }),
            decode({
                call: "DL2XYZ",
                receivedAt: new Date(NOW - STATION_EXPIRY_MS),
            }),
        ];

        expect(calls(decodes)).toEqual([decodes[1]]);
    });

    it("keeps a played back decode with an old time stamp", () => {
        const decodes = [decode({ date: new Date(NOW - 5 * 60 * 60 * 1000) })];

        expect(calls(decodes)).toEqual(decodes);
    });

    it("only returns stations on the current band", () => {
        const decodes = [decode({ band: "40M" }), decode({ call: "DL2XYZ" })];

        expect(calls(decodes, { band: "20M" })).toEqual([decodes[1]]);
    });
});

describe("isMappable", () => {
    it("leaves out stations only placed by country", () => {
        const location = {};

        expect(isMappable({ location, locationSource: "message" })).toBe(true);
        expect(isMappable({ location, locationSource: "history" })).toBe(true);
        expect(isMappable({ location, locationSource: "country" })).toBe(false);
        expect(isMappable({})).toBe(false);
    });
});
