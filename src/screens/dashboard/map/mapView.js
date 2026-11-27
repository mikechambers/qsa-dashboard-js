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

import { LngLatBounds } from "maplibre-gl";

//rough size of the area the popup card covers, at the top right of the map
const POPUP_AREA = { width: 360, openHeight: 260, closedHeight: 56 };

export const isMapAlive = (map) => !!map && !!map.style;

//is the point on screen, and not hidden behind the popup?
export const isInView = (map, [lng, lat], detailOpen) => {
    //the map can show several copies of the world, so use the one nearest the center
    const centerLng = map.getCenter().lng;
    const wrappedLng =
        centerLng + ((((lng - centerLng + 180) % 360) + 360) % 360) - 180;

    const { x, y } = map.project([wrappedLng, lat]);
    const { clientWidth: w, clientHeight: h } = map.getContainer();
    const margin = 30;

    //the popup covers the top right of the map
    const popupHeight = detailOpen
        ? POPUP_AREA.openHeight
        : POPUP_AREA.closedHeight;
    if (x > w - POPUP_AREA.width && y < popupHeight) return false;

    return x > margin && x < w - margin && y > margin && y < h - margin;
};

//zoom the map to show the path from home to somewhere
export const fitPath = (map, [fromLng, fromLat], [toLng, toLat]) => {
    //take the short way around the world
    if (toLng - fromLng > 180) toLng -= 360;
    else if (toLng - fromLng < -180) toLng += 360;

    const bounds = new LngLatBounds(
        [fromLng, fromLat],
        [fromLng, fromLat],
    ).extend([toLng, toLat]);

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;

    //extra room on top, so the spot isn't hidden behind the popup
    map.fitBounds(bounds, {
        padding: { top: 200, bottom: 50, left: 60, right: 60 },
        maxZoom: 6,
        duration: reduceMotion ? 0 : 800,
    });
};
