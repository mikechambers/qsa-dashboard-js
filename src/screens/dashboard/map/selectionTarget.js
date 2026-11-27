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
import { getCSSColorForSNR } from "@/utils/view";
import { STATION_COLORS } from "./config";
import { getSpotMapCoordinates } from "./spotCoordinates";
import { getStationMapCoordinates } from "./useStationLayer";

//what the map needs to show the selection, from either a Spot or a station
//(from getActiveStations). undefined if there is nowhere to show it
//
//  key
//  coordinates: where its marker is drawn (jitter included)
//  at: where it is, for moving the map to it
//  color, stationType (not set for a spot), line (draw a line from home)
export function getSelectionTarget(key, spot, station) {
    if (spot) {
        if (!spot.receiverLocation) return;

        return {
            key,
            coordinates: getSpotMapCoordinates(spot, ADD_SPOT_JITTER),
            at: spot.receiverLocation.coordinates,
            color: getCSSColorForSNR(spot.snr),
            line: true,
        };
    }

    if (station) {
        return {
            key,
            coordinates: getStationMapCoordinates(station.decode),
            at: station.decode.location.coordinates,
            color: STATION_COLORS[station.type],
            stationType: station.type,
            //calling us and being worked already have a line from home
            line: !station.callingYou && !station.working,
        };
    }
}
