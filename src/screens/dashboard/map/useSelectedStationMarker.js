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
    EMPTY_FEATURE_COLLECTION,
    SELECTED_STATION_PATH,
    STATION_COLORS,
} from "./config";
import { getStationIconURL } from "./stationIcons";
import { isMapAlive } from "./useSpotHighlightEffects";
import { getStationMapCoordinates } from "./useStationLayer";

import classes from "./SpotPopup.module.css";

//how long the marker lingers to play its exit animation (.out in the css)
const EXIT_MS = 200;

//draws the selected heard / CQ station like a selected spot: a larger marker
//and ring that pop in, and a line from home. station is from
//getActiveStations, and must be mappable. undefined if none is selected
export function useSelectedStationMarker(map, ready, station, location) {
    const type = station?.type;
    const call = station?.decode.call;
    const grid = station?.decode.location.grid;
    //calling us and being worked already have a line from home
    const hasLine = station?.callingYou || station?.working;

    useEffect(() => {
        if (!map || !ready || !station) return;

        const el = document.createElement("div");
        el.className = classes.marker;
        el.style.setProperty("--spot-color", STATION_COLORS[type]);

        const ring = document.createElement("div");
        ring.className = classes.ring;

        const pin = document.createElement("img");
        pin.className = classes.pin;
        pin.src = getStationIconURL(type);
        pin.alt = "";

        el.append(ring, pin);

        const marker = new Marker({ element: el })
            .setLngLat(getStationMapCoordinates(station.decode))
            .addTo(map);

        return () => {
            //as for spots, shrink away before removing, unless the map is
            //gone or the user prefers reduced motion
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
    }, [map, ready, call, type, grid]);

    useEffect(() => {
        if (!map || !ready || !station || !location || hasLine) return;

        map.getSource(SELECTED_STATION_PATH)?.setData(
            greatCircle(
                location.coordinates,
                getStationMapCoordinates(station.decode),
                { npoints: 64 },
            ),
        );

        return () => {
            if (!isMapAlive(map)) return;

            map.getSource(SELECTED_STATION_PATH)?.setData(
                EMPTY_FEATURE_COLLECTION,
            );
        };
    }, [map, ready, call, grid, hasLine, location?.id]);
}
