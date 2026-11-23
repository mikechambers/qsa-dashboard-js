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

import { DisplayMode } from "../../../enums/DisplayMode";
import {
    getTwilightGeoJSON,
    getNightGeoJSON,
    getDayGeoJSON,
} from "@/lib/twilight";
import { EMPTY_FEATURE_COLLECTION } from "./config";

export const TWILIGHT_REFRESH_MS = 60_000;

const TWILIGHT_LINES = "TWILIGHT_LINES";
const NIGHT_PATH = "NIGHT_PATH";
const DAY_PATH = "DAY_PATH";

//settings on how to draw grey line shapes. One for night and one for day.
//and settings for light / dark modes.
const TWILIGHT_PALETTE = {
    dark: {
        fill: "#1b2f7a",
        fillOpacity: 0, // night shading off in dark mode
        dayFill: "#ffffff",
        dayFillOpacity: 0.08,
        line: "#55555555",
        lineWidth: 1.0,
        lineOpacity: [
            "match",
            ["get", "elevation"],
            0,
            1,
            -6,
            0.9,
            -12,
            0.8,
            0.6,
        ],
    },
    light: {
        fill: "#000000",
        fillOpacity: 0.1,
        dayFill: "#ffffff",
        dayFillOpacity: 0, //day off in light mode
        line: "#AAAAAA55",
        lineWidth: 1,
        lineOpacity: [
            "match",
            ["get", "elevation"],
            0,
            0.9,
            -6,
            0.7,
            -12,
            0.6,
            0.45,
        ],
    },
};

//this function initializes layers need to draw greylines graphics
//they don't actually draw it, just set up the layers
export function addGreylineLayers(map, settings) {
    const theme =
        settings.displayMode === DisplayMode.DARK
            ? TWILIGHT_PALETTE.dark
            : TWILIGHT_PALETTE.light;

    /******** GREYLINE DAY LAYER ***********/
    map.addSource(DAY_PATH, {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION,
    });

    map.addLayer({
        id: DAY_PATH,
        type: "fill",
        source: DAY_PATH,
        paint: {
            "fill-color": theme.dayFill,
            "fill-opacity": theme.dayFillOpacity,
            "fill-antialias": false,
        },
    });

    /******** GREYLINE NIGHT LAYER ***********/
    map.addSource(NIGHT_PATH, {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION,
    });
    map.addLayer({
        id: NIGHT_PATH,
        type: "fill",
        source: NIGHT_PATH,
        paint: {
            "fill-color": theme.fill,
            "fill-opacity": theme.fillOpacity,
            "fill-antialias": false,
        },
    });

    /******** GREYLINE LINES LAYER ***********/

    //lines in between the sections
    map.addSource(TWILIGHT_LINES, {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION,
    });
    map.addLayer({
        id: TWILIGHT_LINES,
        type: "line",
        source: TWILIGHT_LINES,
        paint: {
            "line-color": theme.line,
            "line-width": [
                "match",
                ["get", "elevation"],
                0,
                theme.lineWidth + 1,
                theme.lineWidth,
            ],
            "line-opacity": theme.lineOpacity,
        },
    });
}

//clear all graphics (for when they disable greyline viewing)
export function clearGreyline(map) {
    map.getSource(TWILIGHT_LINES)?.setData(EMPTY_FEATURE_COLLECTION);
    map.getSource(NIGHT_PATH)?.setData(EMPTY_FEATURE_COLLECTION);
    map.getSource(DAY_PATH)?.setData(EMPTY_FEATURE_COLLECTION);
}

//this is what actually draws the greylines. Dynamically generating
//base on time of day / where the sun is.
export function updateGreyline(map, settings) {
    const now = new Date();

    map.getSource(TWILIGHT_LINES)?.setData(
        getTwilightGeoJSON(now, settings.elevationValues),
    );
    map.getSource(NIGHT_PATH)?.setData(
        getNightGeoJSON(now, settings.elevationValues),
    );
    map.getSource(DAY_PATH)?.setData(
        getDayGeoJSON(now, settings.elevationValues),
    );
}
