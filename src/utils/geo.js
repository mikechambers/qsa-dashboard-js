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

import Location from "@/models/Location";
import { gridToLocation as libGridToLocation } from "@ham2k/lib-geo-tools";
import { DXCC_BY_CODE } from "@ham2k/lib-dxcc-data";
import { mulberry32Random } from "./math";
import { normalizeMaidenHeadGrid } from "./radio";

//size of grid based on grid length
const CELL_SIZE = {
    2: [10, 20],
    4: [1, 2],
    6: [1 / 24, 1 / 12],
};

//note, we split this out in case we want to add the jitter at the map stage, not the storage stage.
export const getJitteredCoordinates = (location, jitterSeed) => {
    let [long, lat] = location.coordinates;

    const JITTER_SPREAD = 1.0;
    const rand = mulberry32Random(jitterSeed);
    const [cellLat, cellLon] = CELL_SIZE[location.grid.length] ?? CELL_SIZE[6];
    const cosLat = Math.cos((lat * Math.PI) / 180);

    // Figure out max radius that will stay within the grid.
    const maxR = Math.min(cellLat / 2, (cellLon / 2) * cosLat) * JITTER_SPREAD;

    const angle = rand() * 2 * Math.PI;
    const radius = maxR * Math.sqrt(rand()); // sqrt = even spread over the area

    lat += radius * Math.sin(angle);
    long += (radius * Math.cos(angle)) / cosLat;

    return [long, lat];
};

export const gridToLocation = function (grid) {
    const g = normalizeMaidenHeadGrid(grid);
    let [lat, long] = libGridToLocation(g);

    return new Location({ grid: g, latitude: lat, longitude: long });
};

export const getDXCCEntity = function (code) {
    return DXCC_BY_CODE[code];
};

export const kilometersToMiles = function (kilometers) {
    if (!kilometers) {
        return 0;
    }

    return kilometers * 0.621371;
};

export const milesToKilometers = function (miles) {
    if (!miles) {
        return 0;
    }

    return miles * 1.60934;
};
