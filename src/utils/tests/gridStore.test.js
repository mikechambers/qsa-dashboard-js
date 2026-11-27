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
import Decode from "@/models/Decode";
import { createGridStore, withKnownGrid } from "../gridStore";
import { gridToLocation } from "../geo";

const home = gridToLocation("CM87");

const rough = new Decode({
    call: "K1ABC",
    location: { latitude: 38, longitude: -97 },
    locationSource: "country",
    distance: 2000,
});

describe("createGridStore", () => {
    it("knows nothing at first", () => {
        expect(createGridStore().find("K1ABC")).toBeUndefined();
    });

    it("prefers a grid heard over the air to one from a spot", () => {
        const grids = createGridStore();
        grids.addReported("K1ABC", "EM12ab");
        expect(grids.find("k1abc")).toEqual({
            grid: "EM12ab",
            source: "spot",
        });

        grids.addHeard("K1ABC", "FN42");
        grids.addReported("K1ABC", "DM79");
        expect(grids.find("K1ABC")).toEqual({
            grid: "FN42",
            source: "history",
        });
    });

    it("trims long grids and ignores bad ones", () => {
        const grids = createGridStore();
        grids.addReported("A1A", "FN42ab12");
        grids.addReported("B1B", "nonsense");
        grids.addReported("C1C", undefined);

        expect(grids.find("A1A").grid).toBe("FN42ab");
        expect(grids.find("B1B")).toBeUndefined();
        expect(grids.find("C1C")).toBeUndefined();
    });
});

describe("refine", () => {
    it("uses a longer spot grid that is inside the one given", () => {
        const grids = createGridStore();
        grids.addReported("K1ABC", "FN42ab");

        expect(grids.refine("k1abc", "FN42")).toBe("FN42ab");
        //somewhere else, such as when portable
        expect(grids.refine("K1ABC", "EM12")).toBe("EM12");
        expect(grids.refine("W6DEF", "FN42")).toBe("FN42");
    });
});

describe("withKnownGrid", () => {
    it("makes a grid from a message more precise", () => {
        const grids = createGridStore();
        grids.addReported("K1ABC", "FN42ab");
        const own = new Decode({
            call: "K1ABC",
            location: gridToLocation("FN42"),
            locationSource: "message",
        });

        const d = withKnownGrid(own, grids, home);
        expect(d.location.grid.toUpperCase()).toBe("FN42AB");
        expect(d.locationSource).toBe("message");
    });

    it("places a station and works out the distance again", () => {
        const grids = createGridStore();
        grids.addReported("K1ABC", "FN42");

        const d = withKnownGrid(rough, grids, home);

        expect(d).toBeInstanceOf(Decode);
        expect(d.locationSource).toBe("spot");
        expect(d.location.grid).toBe("FN42");
        expect(d.distance).toBeGreaterThan(4000);
        expect(rough.locationSource).toBe("country");
    });

    it("leaves a decode with its own grid, or an unknown station", () => {
        const grids = createGridStore();
        expect(withKnownGrid(rough, grids, home)).toBe(rough);

        grids.addReported("K1ABC", "FN42");
        const own = new Decode({ call: "K1ABC", locationSource: "message" });
        expect(withKnownGrid(own, grids, home)).toBe(own);
    });
});
