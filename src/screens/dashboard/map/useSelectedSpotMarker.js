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

import { getCSSColorForSNR } from "@/utils/view";
import { ADD_SPOT_JITTER } from "@/consts/config";
import { getJitteredCoordinates } from "@/utils/geo";

import classes from "./SpotPopup.module.css";

//how long the marker lingers to play its exit animation (.out in the css)
const EXIT_MS = 200;

//draws the selected spot as an HTML marker (ring and dot) above all other
//spots. The detail card is separate (see SpotPopup).
export function useSelectedSpotMarker(map, ready, selectedSpot) {
    const id = selectedSpot?.id;

    useEffect(() => {
        if (!map || !ready || !selectedSpot?.receiverLocation) return;

        //if we are using spot jitter we need to adjust for it
        const coordinates = ADD_SPOT_JITTER
            ? getJitteredCoordinates(
                  selectedSpot.receiverLocation,
                  selectedSpot.id,
              )
            : selectedSpot.receiverLocation.coordinates;

        const color = getCSSColorForSNR(selectedSpot.snr);

        //ring and dot, a marker on the map so it moves with it
        const el = document.createElement("div");
        el.className = classes.marker;
        el.style.setProperty("--spot-color", color);

        const ring = document.createElement("div");
        ring.className = classes.ring;

        const dot = document.createElement("div");
        dot.className = classes.dot;

        el.append(ring, dot);

        const marker = new Marker({ element: el })
            .setLngLat(coordinates)
            .addTo(map);

        return () => {
            //let the ring and dot shrink away before removing the marker.
            //skip that if the map is already gone (unmounting) or the user
            //prefers reduced motion.
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
    }, [map, ready, id]);
}
