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

import { Platform } from "@/enums/Platform";
import { StationType } from "@/enums/StationType";
import { PLATFORM } from "@/utils/platform";

//empty featurecollection to use to clear layers
export const EMPTY_FEATURE_COLLECTION = {
    type: "FeatureCollection",
    features: [],
};

export const LOCATION_COLOR = "#1c7ed6";
export const CONNECTION_LINE_PATH = "CONNECTION_LINE_PATH";
export const SPOT_PATH = "SPOT_PATH";
export const CONNECTION_POINT = "CONNECTION_POINT";
export const STATION_PATH = "STATION_PATH";
//lines from home to stations calling us (dashed) and being worked (solid)
export const STATION_LINE_PATH = "STATION_LINE_PATH";
export const STATION_CALLING_LAYER = "STATION_CALLING_LAYER";
export const STATION_LINE_COLOR = "#c2255c";
//colors for the type of station. Not signal strength colors, so they aren't
//mistaken for spots
export const STATION_COLORS = {
    [StationType.CQ]: "#9c36b5",
    [StationType.HEARD]: "#2f63a6",
    [StationType.SPOT]: "#495057",
};
export const DISTANCE_RANGE_PATH = "DISTANCE_RANGE_PATH";
export const FURTHEST_RANGE_PATH = "FURTHEST_RANGE_PATH";
export const DISTANCE_LABEL_PATH = "DISTANCE_LABEL_PATH";
export const DISTANCE_LABEL_SIZE = 12;
//the font has to exist in the map style. The offline fonts have no Bold
export const DISTANCE_LABEL_FONT =
    PLATFORM === Platform.DESKTOP ? "Noto Sans Medium" : "Noto Sans Bold";

export const CIRCLE_RADIUS = 6;
export const CIRCLE_STROKE = 2;
export const DEFAULT_ZOOM = 3;
