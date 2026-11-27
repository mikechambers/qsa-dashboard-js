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
import {
    getSpotMapCoordinates,
    getStationMapCoordinates,
} from "../spotCoordinates";
import { gridToLocation } from "@/utils/geo";

const spot = (call = "K1ABC", grid = "FN42", id = 1) => ({
    id,
    receiverCall: call,
    receiverLocation: gridToLocation(grid),
});

const decode = (call = "K1ABC", grid = "FN42") => ({
    call,
    location: gridToLocation(grid),
});

describe("getSpotMapCoordinates", () => {
    it("returns the exact location when jitter is off", () => {
        const s = spot();
        expect(getSpotMapCoordinates(s, false)).toEqual(
            s.receiverLocation.coordinates,
        );
    });

    it("returns a point near the location when jitter is on", () => {
        const s = spot();
        expect(getSpotMapCoordinates(s, true)).not.toEqual(
            s.receiverLocation.coordinates,
        );
    });

    it("puts every spot from a station on the same point", () => {
        expect(getSpotMapCoordinates(spot("K1ABC", "FN42", 1), true)).toEqual(
            getSpotMapCoordinates(spot("K1ABC", "FN42", 2), true),
        );
    });

    it("spreads stations that share a grid square", () => {
        expect(getSpotMapCoordinates(spot("K1ABC"), true)).not.toEqual(
            getSpotMapCoordinates(spot("W6DEF"), true),
        );
    });

    it("ignores precision beyond 6 characters", () => {
        expect(getSpotMapCoordinates(spot("K1ABC", "FN42ab12"), true)).toEqual(
            getSpotMapCoordinates(spot("K1ABC", "FN42ab"), true),
        );
    });
});

describe("getStationMapCoordinates", () => {
    it("puts a heard station on the same point as its spots", () => {
        expect(getStationMapCoordinates(decode(), true)).toEqual(
            getSpotMapCoordinates(spot(), true),
        );
    });
});
