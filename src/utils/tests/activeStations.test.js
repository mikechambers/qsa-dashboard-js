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
    getActiveStations,
    getShownStations,
    getWorkingCall,
    isMappable,
    mergeHeard,
    withDistanceFrom,
} from "../activeStations";
import { CQ_EXPIRY_MS } from "@/consts/config";
import { DecodeKind } from "@/enums/DecodeKind";
import { StationType } from "@/enums/StationType";
import { gridToLocation } from "@/utils/geo";

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0);

const decode = (values) => ({
    call: "K1ABC",
    kind: DecodeKind.CQ,
    band: "20M",
    receivedAt: new Date(NOW),
    ...values,
});

const calls = (decodes, options) =>
    getActiveStations(decodes, { now: NOW, ...options }).map((s) => s.decode);

describe("getActiveStations", () => {
    it("returns each station once, using its newest decode", () => {
        const decodes = [decode({ snr: -5 }), decode({ snr: -12 })];

        expect(calls(decodes)).toEqual([decodes[0]]);
    });

    it("tells CQs from other stations", () => {
        const decodes = [
            decode(),
            decode({
                call: "DL2XYZ",
                kind: DecodeKind.REPORT,
                toCall: "N1XYZ",
            }),
        ];
        const types = getActiveStations(decodes, { now: NOW }).map(
            (s) => s.type,
        );

        expect(types).toEqual([StationType.CQ, StationType.HEARD]);
    });

    it("marks stations calling us, until they sign off", () => {
        const to = (call, kind) => decode({ call, kind, toCall: "W6MSH" });
        const decodes = [
            to("DL2XYZ", DecodeKind.GRID),
            to("G4ABC", DecodeKind.SEVENTY_THREE),
            to("F5ABC", DecodeKind.RR73),
        ];
        const flags = getActiveStations(decodes, {
            now: NOW,
            myCall: "W6MSH",
        }).map((s) => s.callingYou);

        expect(flags).toEqual([true, false, false]);
    });

    it("marks the station being worked, and keeps it if it fades", () => {
        const old = decode({
            toCall: "W6MSH",
            kind: DecodeKind.REPORT,
            receivedAt: new Date(NOW - CQ_EXPIRY_MS - 1),
        });
        const [station] = getActiveStations([old], {
            now: NOW,
            myCall: "W6MSH",
            workingCall: "K1ABC",
        });

        expect(station).toMatchObject({ working: true, callingYou: false });
    });

    it("uses only the latest thing a station said", () => {
        const decodes = [
            decode({ kind: DecodeKind.REPORT, toCall: "N1XYZ" }),
            decode(),
        ];

        expect(calls(decodes)).toEqual([decodes[0]]);
    });

    it("leaves out our own call", () => {
        expect(calls([decode()], { myCall: "K1ABC" })).toEqual([]);
    });

    it("shows an old CQ as heard, and keeps it", () => {
        const decodes = [
            decode({ receivedAt: new Date(NOW - CQ_EXPIRY_MS - 1) }),
            decode({
                call: "DL2XYZ",
                receivedAt: new Date(NOW - CQ_EXPIRY_MS),
            }),
        ];
        const types = getActiveStations(decodes, { now: NOW }).map(
            (s) => s.type,
        );

        expect(types).toEqual([StationType.HEARD, StationType.CQ]);
    });

    it("stops showing an old call to us as calling you", () => {
        const old = decode({
            kind: DecodeKind.GRID,
            toCall: "W6MSH",
            receivedAt: new Date(NOW - CQ_EXPIRY_MS - 1),
        });
        const [station] = getActiveStations([old], {
            now: NOW,
            myCall: "W6MSH",
        });

        expect(station.callingYou).toBe(false);
    });

    it("keeps a played back decode with an old time stamp", () => {
        const decodes = [decode({ date: new Date(NOW - 5 * 60 * 60 * 1000) })];

        expect(calls(decodes)).toEqual(decodes);
    });

    it("keeps each band, with CQs only on the current one", () => {
        const decodes = [decode({ band: "40M" }), decode()];
        const stations = getActiveStations(decodes, {
            now: NOW,
            band: "20M",
            workingCall: "K1ABC",
        });

        expect(stations.map((s) => [s.type, s.working])).toEqual([
            [StationType.HEARD, false],
            [StationType.CQ, true],
        ]);
    });

    it("has nothing live once WSJT-X has gone", () => {
        const [station] = getActiveStations([decode()], {
            now: NOW,
            workingCall: "K1ABC",
            live: false,
        });

        expect(station).toMatchObject({
            type: StationType.HEARD,
            working: false,
        });
    });
});

describe("mergeHeard", () => {
    it("keeps the latest of each station on each band, up to a limit", () => {
        const older = [decode({ snr: 1 }), decode({ band: "40M" })];
        const newer = [decode({ snr: 2 }), decode({ call: undefined })];

        expect(mergeHeard(newer, older, 10)).toEqual([newer[0], older[1]]);
        expect(mergeHeard(newer, older, 1)).toEqual([newer[0]]);
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

describe("getWorkingCall", () => {
    const status = { txEnabled: true, dxCall: "K1ABC", txMessage: "" };

    it("is the DX call while Tx is on", () => {
        expect(getWorkingCall(status)).toBe("K1ABC");
        expect(
            getWorkingCall({
                ...status,
                txEnabled: false,
                transmitting: true,
            }),
        ).toBe("K1ABC");
    });

    it("is nothing while Tx is off", () => {
        expect(getWorkingCall({ ...status, txEnabled: false })).toBe(undefined);
        expect(getWorkingCall(null)).toBe(undefined);
    });

    it("is nothing while calling CQ", () => {
        expect(getWorkingCall({ ...status, txMessage: "CQ W6MSH CM87" })).toBe(
            undefined,
        );
    });
});

describe("getShownStations", () => {
    const station = (values) => ({
        type: StationType.HEARD,
        ...values,
    });

    it("hides filtered types, including stations with a line", () => {
        const stations = [
            station(),
            station({ type: StationType.CQ }),
            station({ callingYou: true }),
            station({ working: true }),
        ];
        const show = { [StationType.HEARD]: false, [StationType.CQ]: true };

        expect(getShownStations(stations, show)).toEqual([stations[1]]);
    });
});

describe("withDistanceFrom", () => {
    const home = gridToLocation("CM87");
    const location = gridToLocation("JN18");

    it("measures from home, replacing any distance it had", () => {
        const result = withDistanceFrom({ location, distance: 1 }, home);

        expect(result.distance).toBeGreaterThan(8000);
        expect(result.location).toBe(location);
    });

    it("has no distance without both ends", () => {
        expect(withDistanceFrom({ location }, undefined).distance).toBe(
            undefined,
        );
        expect(withDistanceFrom({ distance: 1 }, home).distance).toBe(
            undefined,
        );
    });
});
