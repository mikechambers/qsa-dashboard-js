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
import { LOCATION_COLOR } from "./config";

import classes from "./useHomeMarker.module.css";

//hook for creating and setting home marker
export function useHomeMarker(map, location) {
    useEffect(() => {
        if (!map || !location) return;

        //html element so the css class can animate / pulse it
        const el = document.createElement("div");
        el.className = classes.homeMarker;
        el.style.setProperty("--home-color", LOCATION_COLOR);

        //add to map as HTML element. Will be on top of anything draw into
        //layers.
        const marker = new Marker({ element: el })
            .setLngLat([location.longitude, location.latitude])
            .addTo(map);

        return () => marker.remove();
    }, [map, location?.id]);
}
