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
import { getCSSColorForSNR } from "@/utils/view";
import { SPOT_PATH } from "./config";
import { ADD_SPOT_JITTER } from "@/consts/config";
import { getSpotMapCoordinates } from "./spotCoordinates";

//hook that manages drawing contact spots on the map
export function useSpotLayer(map, ready, spots) {
    //redraw when spots change (once map is ready)
    useEffect(() => {
        if (!map || !ready) return;

        //create the geojson for the spots
        const features = spots.map((s) => {
            const c = getSpotMapCoordinates(s, ADD_SPOT_JITTER);

            return {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: c,
                },
                properties: { color: getCSSColorForSNR(s.snr), spotId: s.id },
            };
        });

        //draw the actual spots
        map.getSource(SPOT_PATH)?.setData({
            type: "FeatureCollection",
            features,
        });
    }, [map, ready, spots]);
}
