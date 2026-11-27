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

//every grid square learned this session, from what stations send over the air
//and from PSK Reporter spots. Used to place a station whose latest message had
//no grid. Kept in memory only

import { distanceOnEarth } from "@ham2k/lib-geo-tools";
import Decode from "@/models/Decode";
import { gridToLocation } from "./geo";
import { isValidMaidenHeadGrid } from "./radio";

export function createGridStore() {
    const heard = new Map(); //callsign -> grid they sent
    const reported = new Map(); //callsign -> grid on their spot

    const add = (grids, call, grid) => {
        //spots can have longer grids than we need
        const g = grid?.slice(0, 6);
        if (call && g && isValidMaidenHeadGrid(g)) {
            grids.set(call.toUpperCase(), g);
        }
    };

    return {
        //a grid we decoded
        addHeard: (call, grid) => add(heard, call, grid),
        //the grid of a station that spotted us
        addReported: (call, grid) => add(reported, call, grid),

        //the longer grid from their spots, if it is inside this one, as it
        //says more precisely where they are. Otherwise the grid given
        refine(call, grid) {
            const spotted = reported.get(call?.toUpperCase());
            const inside =
                grid &&
                spotted?.length > grid.length &&
                spotted.toUpperCase().startsWith(grid.toUpperCase());

            return inside ? spotted : grid;
        },

        //{ grid, source } or undefined. What was sent over the air wins, as
        //it is what the station is saying itself
        find(call) {
            const key = call?.toUpperCase();

            if (heard.has(key)) {
                return { grid: heard.get(key), source: "history" };
            }
            if (reported.has(key)) {
                return { grid: reported.get(key), source: "spot" };
            }
        },
    };
}

//the one the app uses
export const gridStore = createGridStore();

//a copy of the decode placed at the best grid we know: the one in its message,
//or else one we learned, made more precise if their spots have a longer one.
//Otherwise the same decode. home is our Location, for the distance
export function withKnownGrid(decode, grids, home) {
    const known =
        decode.locationSource === "message"
            ? { grid: decode.location?.grid, source: "message" }
            : grids.find(decode.call);
    if (!known) return decode;

    const grid = grids.refine(decode.call, known.grid);
    if (known.source === "message" && grid === known.grid) return decode;

    const location = gridToLocation(grid);

    return new Decode({
        ...decode,
        location,
        locationSource: known.source,
        distance: home ? distanceOnEarth(home, location) : undefined,
    });
}
