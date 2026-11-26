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
import { StationType } from "@/enums/StationType";
import { TableTab } from "@/enums/TableTab";
import {
    getSelectedTab,
    getTabCounts,
    getTabFilter,
    getTableRows,
    shortAge,
} from "../tableRows";

const at = (seconds) => new Date(seconds * 1000);

const spot = (sequence, call, seconds) => ({
    sequence,
    receiverCall: call,
    date: at(seconds),
});

const station = (type, call, seconds) => ({
    type,
    decode: { call, receivedAt: at(seconds), band: "20M", frequency: 1 },
});

const show = (spots, heard, cq) => ({
    [StationType.SPOT]: spots,
    [StationType.HEARD]: heard,
    [StationType.CQ]: cq,
});

const spots = [spot(2, "A", 30), spot(1, "A", 10)];
const stations = [
    station(StationType.HEARD, "B", 20),
    station(StationType.CQ, "C", 40),
];

describe("getTableRows", () => {
    const calls = (filter) =>
        getTableRows(spots, stations, filter).map((r) => r.call);

    it("mixes everything, newest first", () => {
        expect(calls(show(true, true, true))).toEqual(["C", "A", "B", "A"]);
    });

    it("has only the types that are on", () => {
        expect(calls(show(true, false, false))).toEqual(["A", "A"]);
        expect(calls(show(false, true, false))).toEqual(["B"]);
        expect(calls(show(false, true, true))).toEqual(["C", "B"]);
        expect(calls(show(false, false, false))).toEqual([]);
    });

    it("gives every row its own key", () => {
        const keys = getTableRows(spots, stations, show(true, true, true)).map(
            (r) => r.key,
        );
        expect(new Set(keys).size).toBe(keys.length);
    });

    it("has no frequency without a band", () => {
        const [row] = getTableRows(
            [],
            [
                {
                    type: StationType.CQ,
                    decode: { call: "C", receivedAt: at(1), frequency: 1500 },
                },
            ],
            show(true, true, true),
        );
        expect(row.frequency).toBeUndefined();
    });
});

describe("tabs and the type filter", () => {
    it("counts every tab", () => {
        expect(getTabCounts(spots, stations)).toEqual({
            [TableTab.ALL]: 4,
            [TableTab.SPOTS]: 2,
            [TableTab.HEARD]: 1,
            [TableTab.CQ]: 1,
        });
    });

    it.each(Object.values(TableTab))("picking %s selects it", (tab) => {
        expect(getSelectedTab(getTabFilter(tab))).toBe(tab);
    });

    it("selects no tab for a mix or nothing", () => {
        expect(getSelectedTab(show(true, false, true))).toBeUndefined();
        expect(getSelectedTab(show(false, false, false))).toBeUndefined();
    });
});

describe("shortAge", () => {
    it.each([
        [8, "8s"],
        [125, "2m"],
        [7300, "2h"],
        [90000, "1d"],
        [-2, "0s"],
    ])("%i seconds is %s", (seconds, text) => {
        expect(shortAge(at(0), seconds * 1000)).toBe(text);
    });
});
