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

import { StationType } from "@/enums/StationType";
import { STATION_COLORS } from "./config";
import { getStationIconURL } from "./stationIcons";

//the map symbol for a type, for use in buttons
export const TypeIcon = ({ type, size = 1 }) =>
    type === StationType.SPOT ? (
        <svg
            width={16 * size}
            height={16 * size}
            viewBox="0 0 16 16"
            aria-hidden="true"
            //don't let a narrow row squeeze it away
            style={{ flexShrink: 0 }}
        >
            <circle cx="8" cy="8" r="7" fill={STATION_COLORS[type]} />
        </svg>
    ) : (
        <img
            src={getStationIconURL(type)}
            alt=""
            width={20 * size}
            height={25 * size}
            style={{ flexShrink: 0 }}
        />
    );
