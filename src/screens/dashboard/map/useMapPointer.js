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
import { spotKey, stationKey } from "@/utils/selection";
import { SPOT_PATH, STATION_PATH } from "./config";

//the selection key of the marker at a point on the map, or undefined.
//A station's marker is on top of the spot, so it wins
const getKeyAt = (map, point) => {
    const hit = (layer) =>
        map.getLayer(layer)
            ? map.queryRenderedFeatures(point, { layers: [layer] })[0]
            : undefined;

    const station = hit(STATION_PATH);
    if (station) return stationKey(station.properties.call);

    const spot = hit(SPOT_PATH);
    if (spot) return spotKey(spot.properties.spotId);
};

//hook for the mouse (and taps) on spots and stations. onHover is called with
//the key under the mouse. onClick is called with the key clicked, or undefined
//for a click anywhere else
export function useMapPointer(map, ready, onHover, onClick) {
    const hoverRef = useRef(onHover);
    const clickRef = useRef(onClick);

    useEffect(() => {
        hoverRef.current = onHover;
        clickRef.current = onClick;
    }, [onHover, onClick]);

    useEffect(() => {
        if (!map || !ready) return;

        //mousemove (not just mouseenter) so moving straight from one marker
        //to a neighboring one still updates the selection. Moving off a marker
        //leaves it selected
        const handleMove = (e) => {
            const key = getKeyAt(map, e.point);
            map.getCanvas().style.cursor = key ? "pointer" : "";
            if (key) hoverRef.current(key);
        };

        const handleClick = (e) => clickRef.current(getKeyAt(map, e.point));

        map.on("mousemove", handleMove);
        map.on("click", handleClick);

        return () => {
            map.off("mousemove", handleMove);
            map.off("click", handleClick);
        };
    }, [map, ready]);
}
