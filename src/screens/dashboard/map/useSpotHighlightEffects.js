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

import { useEffect } from "react";
import greatCircle from "@turf/great-circle";
import { ADD_SPOT_JITTER } from "@/consts/config";
import { getSpotMapCoordinates } from "./spotCoordinates";
import {
    CONNECTION_LINE_PATH,
    CONNECTION_POINT,
    EMPTY_FEATURE_COLLECTION,
} from "./config";

export const isMapAlive = (map) => !!map && !!map.style;

//hook that handles / controls spot highlights / animations
export function useSpotHighlightEffects(map, ready, selectedSpot, location) {
    //draws line from home to the selected spot
    useEffect(() => {
        if (!map || !ready || !selectedSpot || !location) return;

        if (!selectedSpot.receiverLocation) return;

        //same point the spot dot is drawn at (jitter included)
        const to = getSpotMapCoordinates(selectedSpot, ADD_SPOT_JITTER);

        //draw the line
        map.getSource(CONNECTION_LINE_PATH)?.setData(
            greatCircle(location.coordinates, to, {
                npoints: 64,
            }),
        );

        //draw a small circle on the selectedSpot
        map.getSource(CONNECTION_POINT)?.setData({
            type: "Feature",
            geometry: { type: "Point", coordinates: to },
            properties: {},
        });

        //clear everything when unselected
        return () => {
            if (!isMapAlive(map)) return;

            map.getSource(CONNECTION_LINE_PATH)?.setData(
                EMPTY_FEATURE_COLLECTION,
            );
            map.getSource(CONNECTION_POINT)?.setData(EMPTY_FEATURE_COLLECTION);
        };
    }, [map, ready, selectedSpot?.id, location?.id]);
}
