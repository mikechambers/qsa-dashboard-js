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

import { ADD_SPOT_JITTER } from "@/consts/config";
import { getJitteredCoordinates, gridToLocation } from "@/utils/geo";

//turns a callsign into a number, so a station is always jittered the same way
const hashCall = (call = "") =>
    [...call.toUpperCase()].reduce(
        (hash, c) => (hash * 31 + c.charCodeAt(0)) | 0,
        0,
    );

//where to draw a station on the map. With jitter on, it is nudged to a
//repeatable random point inside its grid square, so stations sharing a grid
//don't stack. The point depends only on the callsign and grid, so a station's
//spot dots and its heard / CQ pin land on top of each other
const getMapCoordinates = (call, location, jitterOn) => {
    if (!jitterOn) return location.coordinates;

    //6 characters is as precise as a decode can be placed (see gridStore)
    const square =
        location.grid.length > 6
            ? gridToLocation(location.grid.slice(0, 6))
            : location;

    return getJitteredCoordinates(square, hashCall(call));
};

//everything that draws a spot should use this, so the dot, marker and path
//line all land on the same point
export const getSpotMapCoordinates = (spot, jitterOn = ADD_SPOT_JITTER) =>
    getMapCoordinates(spot.receiverCall, spot.receiverLocation, jitterOn);

//the same for a station heard by WSJT-X, from its decode
export const getStationMapCoordinates = (decode, jitterOn = ADD_SPOT_JITTER) =>
    getMapCoordinates(decode.call, decode.location, jitterOn);
