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
import { getJitteredCoordinates, gridToLocation } from "@/utils/geo";

//half the size of a grid square, in degrees [lat, lon], by grid length
const HALF_CELL = {
    2: [5, 10],
    4: [0.5, 1],
    6: [1 / 48, 1 / 24],
};

const EPSILON = 1e-9;

describe("getJitteredCoordinates", () => {
    it("gives the same point for the same location and seed", () => {
        const loc = gridToLocation("FN42");
        expect(getJitteredCoordinates(loc, 42)).toEqual(
            getJitteredCoordinates(loc, 42),
        );
    });

    it("gives different points for different seeds", () => {
        const loc = gridToLocation("FN42");
        expect(getJitteredCoordinates(loc, 1)).not.toEqual(
            getJitteredCoordinates(loc, 2),
        );
    });

    it("moves the point off the center of the square", () => {
        const loc = gridToLocation("FN42");
        expect(getJitteredCoordinates(loc, 7)).not.toEqual(loc.coordinates);
    });

    it("returns [longitude, latitude]", () => {
        const loc = gridToLocation("FN42");
        const [lng, lat] = getJitteredCoordinates(loc, 7);
        expect(Math.abs(lng - loc.longitude)).toBeLessThan(1.01);
        expect(Math.abs(lat - loc.latitude)).toBeLessThan(0.51);
    });

    //the point has to stay inside the grid square it came from
    it.each([
        ["FN42", 4],
        ["FN42pr", 6],
        ["CM87", 4],
        ["QF22", 4], //southern hemisphere
        ["RE78", 4], //southern hemisphere
        ["AA00", 4], //far south west corner of the map
        ["RR99", 4], //far north east corner, near the pole
        ["RR99xx", 6],
    ])("stays inside the square for grid %s", (grid, length) => {
        const loc = gridToLocation(grid);
        expect(grid.length).toBe(length);
        const [halfLat, halfLon] = HALF_CELL[length];

        for (let seed = 0; seed < 500; seed++) {
            const [lng, lat] = getJitteredCoordinates(loc, seed);
            expect(Math.abs(lat - loc.latitude)).toBeLessThanOrEqual(
                halfLat + EPSILON,
            );
            expect(Math.abs(lng - loc.longitude)).toBeLessThanOrEqual(
                halfLon + EPSILON,
            );
        }
    });

    it("handles large sequence numbers as seeds", () => {
        const loc = gridToLocation("FN42");
        const [lng, lat] = getJitteredCoordinates(loc, 4_000_000_000);
        expect(Number.isFinite(lng)).toBe(true);
        expect(Number.isFinite(lat)).toBe(true);
    });
});
