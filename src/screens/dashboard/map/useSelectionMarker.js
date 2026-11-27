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
import { Marker } from "maplibre-gl";
import greatCircle from "@turf/great-circle";
import {
    CONNECTION_LINE_PATH,
    CONNECTION_POINT,
    EMPTY_FEATURE_COLLECTION,
} from "./config";
import { isMapAlive } from "./mapView";
import { getStationIconURL } from "./stationIcons";

import classes from "./SpotPopup.module.css";

//how long the marker lingers to play its exit animation (.out in the css)
const EXIT_MS = 200;

//draws the selected spot or station: a larger HTML marker above all the others,
//and a line from home. The detail card is separate (see SpotPopup). target is
//from getSelectionTarget, undefined if nothing is selected
export function useSelectionMarker(map, ready, target, location) {
    const key = target?.key;
    const type = target?.stationType;
    const position = target?.coordinates.join();
    const hasLine = target?.line;

    //ring with a dot (spot) or a pin (station), so it moves with the map
    useEffect(() => {
        if (!map || !ready || !target) return;

        const el = document.createElement("div");
        el.className = classes.marker;
        el.style.setProperty("--spot-color", target.color);

        const ring = document.createElement("div");
        ring.className = classes.ring;

        let center;
        if (type) {
            center = document.createElement("img");
            center.className = classes.pin;
            center.src = getStationIconURL(type);
            center.alt = "";
        } else {
            center = document.createElement("div");
            center.className = classes.dot;
        }

        el.append(ring, center);

        const marker = new Marker({ element: el })
            .setLngLat(target.coordinates)
            .addTo(map);

        return () => {
            //let the marker shrink away before removing it. Skip that if the
            //map is already gone (unmounting) or the user prefers reduced
            //motion.
            const reduceMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;

            if (!map.style || reduceMotion) {
                marker.remove();
                return;
            }

            el.classList.add(classes.out);
            setTimeout(() => marker.remove(), EXIT_MS);
        };
    }, [map, ready, key, type, position]);

    //line from home, and for a spot a small circle where it ends
    useEffect(() => {
        if (!map || !ready || !target || !location || !hasLine) return;

        map.getSource(CONNECTION_LINE_PATH)?.setData(
            greatCircle(location.coordinates, target.coordinates, {
                npoints: 64,
            }),
        );

        if (!type) {
            map.getSource(CONNECTION_POINT)?.setData({
                type: "Feature",
                geometry: { type: "Point", coordinates: target.coordinates },
                properties: {},
            });
        }

        return () => {
            if (!isMapAlive(map)) return;

            map.getSource(CONNECTION_LINE_PATH)?.setData(
                EMPTY_FEATURE_COLLECTION,
            );
            map.getSource(CONNECTION_POINT)?.setData(EMPTY_FEATURE_COLLECTION);
        };
    }, [map, ready, key, position, hasLine, location?.id]);
}
