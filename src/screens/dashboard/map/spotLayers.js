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

import {
    EMPTY_FEATURE_COLLECTION,
    LOCATION_COLOR,
    SPOT_PATH,
    CONNECTION_LINE_PATH,
    CONNECTION_POINT,
    CIRCLE_RADIUS,
    CIRCLE_STROKE,
} from "./config";

//adds the layers to draw the spot graphics on
//doesn't draw to them yet.
export function addSpotLayer(map) {
    map.addSource(SPOT_PATH, {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION,
        promoteId: "spotId",
    });

    map.addLayer({
        id: SPOT_PATH,
        source: SPOT_PATH,
        type: "circle",
        paint: {
            "circle-radius": CIRCLE_RADIUS,
            "circle-color": ["get", "color"],
            "circle-stroke-width": CIRCLE_STROKE,
            "circle-stroke-color": "white",
        },
    });
}

//adds the layer for drawing the connection line
export function addConnectionLineLayer(map) {
    map.addSource(CONNECTION_LINE_PATH, {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION,
    });

    //the layer we draw the line into. empty until a spot is selected.
    map.addLayer({
        id: CONNECTION_LINE_PATH,
        type: "line",
        layout: { "line-cap": "round" },
        source: CONNECTION_LINE_PATH,
        paint: {
            "line-color": LOCATION_COLOR,
            "line-width": 2,
            "line-opacity": 1.0,
            "line-dasharray": [2, 2],
        },
    });
}

//adds the layer for drawing the point on the connection
export function addConnectionPointLayer(map) {
    map.addSource(CONNECTION_POINT, {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION,
    });

    map.addLayer({
        id: CONNECTION_POINT,
        source: CONNECTION_POINT,
        type: "circle",
        paint: {
            "circle-radius": 4,
            "circle-color": LOCATION_COLOR,
            "circle-stroke-width": 0,
        },
    });
}
