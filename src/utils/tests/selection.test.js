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
    NO_SELECTION,
    getSpotSequence,
    getStationCall,
    hoverSelection,
    pinSelection,
    spotKey,
    stationKey,
    unpinSelection,
} from "../selection";

describe("selection keys", () => {
    it("tells spots and stations apart", () => {
        expect(getSpotSequence(spotKey(12))).toBe(12);
        expect(getStationCall(spotKey(12))).toBeUndefined();
        expect(getStationCall(stationKey("VE3ABC/P"))).toBe("VE3ABC/P");
        expect(getSpotSequence(stationKey("K1ABC"))).toBeUndefined();
    });

    it("handles nothing selected", () => {
        expect(getSpotSequence(undefined)).toBeUndefined();
        expect(getStationCall(undefined)).toBeUndefined();
    });
});

describe("selection", () => {
    it("previews what is hovered", () => {
        const first = hoverSelection(NO_SELECTION, spotKey(1));
        expect(first).toEqual({ key: "spot-1", pinned: false });
        expect(hoverSelection(first, stationKey("K1ABC"))).toEqual({
            key: "station-K1ABC",
            pinned: false,
        });
    });

    it("doesn't change when there is nothing new to preview", () => {
        const selection = hoverSelection(NO_SELECTION, spotKey(1));
        expect(hoverSelection(selection, spotKey(1))).toBe(selection);
        expect(hoverSelection(selection, undefined)).toBe(selection);
    });

    it("keeps what is pinned when something else is hovered", () => {
        const pinned = pinSelection(stationKey("K1ABC"));
        expect(hoverSelection(pinned, spotKey(1))).toBe(pinned);
    });

    it("replaces what is pinned when something else is clicked", () => {
        expect(pinSelection(spotKey(2))).toEqual({
            key: "spot-2",
            pinned: true,
        });
    });

    it("clears when nothing is clicked", () => {
        expect(pinSelection(undefined)).toBe(NO_SELECTION);
    });

    it("stays selected when unpinned, until something else is hovered", () => {
        const unpinned = unpinSelection(pinSelection(spotKey(1)));
        expect(unpinned).toEqual({ key: "spot-1", pinned: false });
        expect(hoverSelection(unpinned, spotKey(2)).key).toBe("spot-2");
    });
});
