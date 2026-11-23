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
import { getSpotMapCoordinates } from "../spotCoordinates";
import { getJitteredCoordinates, gridToLocation } from "@/utils/geo";

const spot = (id = 1, grid = "FN42") => ({
    id,
    receiverLocation: gridToLocation(grid),
});

describe("getSpotMapCoordinates", () => {
    it("returns the exact location when jitter is off", () => {
        const s = spot();
        expect(getSpotMapCoordinates(s, false)).toEqual(
            s.receiverLocation.coordinates,
        );
    });

    it("returns the jittered location when jitter is on", () => {
        const s = spot(99);
        expect(getSpotMapCoordinates(s, true)).toEqual(
            getJitteredCoordinates(s.receiverLocation, 99),
        );
        expect(getSpotMapCoordinates(s, true)).not.toEqual(
            s.receiverLocation.coordinates,
        );
    });

    //the dot, marker and path line all call this, so they have to agree
    it("gives the same point every time for the same spot", () => {
        const s = spot(5);
        expect(getSpotMapCoordinates(s, true)).toEqual(
            getSpotMapCoordinates(s, true),
        );
    });

    it("spreads spots that share a grid square", () => {
        const a = getSpotMapCoordinates(spot(1), true);
        const b = getSpotMapCoordinates(spot(2), true);
        expect(a).not.toEqual(b);
    });
});
