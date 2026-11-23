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

import { useEffect, useState } from "react";
import { Marker } from "maplibre-gl";

import { getCSSColorForSNR } from "@/utils/view";
import { ADD_SPOT_JITTER } from "@/consts/config";
import { getJitteredCoordinates } from "@/utils/geo";

import classes from "./SpotPopup.module.css";

//rough size of the popup card, used to keep it inside the map
const POPUP_HALF_WIDTH = 165;
const POPUP_HEIGHT = 190;
const EDGE_PADDING = 8;

//how long the marker lingers to play its exit animation (.out in the css)
const EXIT_MS = 200;

//draws the selected spot as an HTML marker (ring and dot) above
//all other spots, and creates a popup element in an overlay above the map
//(so it also sits above things like the legend). The popup follows the spot
//as the map moves.
export function useSelectedSpotMarker(map, ready, selectedSpot, overlayRef) {
    const [popupContainer, setPopupContainer] = useState(null);

    const id = selectedSpot?.id;

    useEffect(() => {
        const overlay = overlayRef.current;
        if (!map || !ready || !overlay || !selectedSpot?.receiverLocation)
            return;

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

        //popup, in the overlay above the map
        const popup = document.createElement("div");
        popup.className = classes.popup;

        const body = document.createElement("div");
        body.className = classes.body;
        popup.append(body);
        overlay.append(popup);

        //We read the marker's actual screen position instead of using
        //map.project(). The marker is drawn on whichever copy of the world is
        //nearest the view, but project() uses the raw longitude, so near the
        //left / right edge the popup could land on the other side of the map.
        const update = () => {
            const mapRect = map.getContainer().getBoundingClientRect();
            const markerRect = el.getBoundingClientRect();
            const x = markerRect.left - mapRect.left;
            const y = markerRect.top - mapRect.top;
            const width = mapRect.width;
            const minX = POPUP_HALF_WIDTH + EDGE_PADDING;

            popup.style.transform = `translate(${x}px, ${y}px)`;
            popup.classList.toggle(classes.below, y < POPUP_HEIGHT);

            let shift = 0;
            if (x < minX) shift = minX - x;
            else if (width - x < minX) shift = -(minX - (width - x));
            popup.style.setProperty("--shift", `${shift}px`);
        };

        update();
        map.on("move", update);

        setPopupContainer(body);

        return () => {
            map.off("move", update);
            popup.remove();
            setPopupContainer(null);

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

    return popupContainer;
}
