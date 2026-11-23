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

import { useEffect, useRef } from "react";
import { getCSSColorForSNR } from "@/utils/view";
import { SPOT_PATH } from "./config";
import { ADD_SPOT_JITTER } from "@/consts/config";
import { getJitteredCoordinates } from "@/utils/geo";

//hook that manages drawing contact spots on the map
export function useSpotLayer(map, ready, spots, onSpotHighlight) {
    //so references in enclosures dont become stale
    const spotsRef = useRef(spots);
    const highlightRef = useRef(onSpotHighlight);

    //this is so we can always get a reference to the current spot / highlight
    useEffect(() => {
        spotsRef.current = spots;
        highlightRef.current = onSpotHighlight;
    }, [spots, onSpotHighlight]);

    //redraw when spots change (once map is ready)
    useEffect(() => {
        if (!map || !ready) return;

        //create the geojson for the spots
        const features = spots.map((s) => {
            let c = s.receiverLocation.coordinates;
            c = ADD_SPOT_JITTER
                ? getJitteredCoordinates(s.receiverLocation, s.id)
                : c;

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

    //called once map is ready. We use to init events
    useEffect(() => {
        if (!map || !ready) return;

        //select a spot on hover (mouse) or click / tap (mouse and touch)
        const onSelect = (e) => {
            const id = e.features[0]?.properties.spotId;
            const s = spotsRef.current.find((spot) => spot.id === id);
            if (s) highlightRef.current(s);
        };

        const onEnter = () => {
            map.getCanvas().style.cursor = "pointer";
        };

        //clear the selection (and its popup) when the pointer leaves a spot
        const onLeave = () => {
            map.getCanvas().style.cursor = "";

            //dont unselect when mouse out of spot
            //highlightRef.current(undefined);
        };

        map.on("mouseenter", SPOT_PATH, onEnter);
        //mousemove (not just mouseenter) so moving straight from one spot
        //to a neighboring one still updates the selection
        map.on("mousemove", SPOT_PATH, onSelect);
        map.on("mouseleave", SPOT_PATH, onLeave);
        map.on("click", SPOT_PATH, onSelect);

        //click / tap on empty map: clear selectedSpot
        const onClick = (e) => {
            const hits = map.queryRenderedFeatures(e.point, {
                layers: [SPOT_PATH],
            });
            if (hits.length === 0) {
                highlightRef.current(undefined);
            }
        };
        map.on("click", onClick);

        return () => {
            map.off("mouseenter", SPOT_PATH, onEnter);
            map.off("mousemove", SPOT_PATH, onSelect);
            map.off("mouseleave", SPOT_PATH, onLeave);
            map.off("click", SPOT_PATH, onSelect);
            map.off("click", onClick);
        };
    }, [map, ready]);
}
