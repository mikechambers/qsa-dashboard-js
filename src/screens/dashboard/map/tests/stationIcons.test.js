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

import { describe, expect, it } from "vitest";
import { SignalColor } from "@/enums/SignalColors";
import { StationType } from "@/enums/StationType";
import { STATION_COLORS } from "../config";
import {
    getStationColor,
    getStationIconId,
    getStationSignal,
} from "../stationIcons";

describe("station pin colors", () => {
    it("colors a heard station by its signal strength", () => {
        const signal = getStationSignal(StationType.HEARD, 5);
        expect(signal).toBe(SignalColor.STRONG);
        expect(getStationColor(StationType.HEARD, signal)).toBe(
            SignalColor.getColorForSNR(5),
        );
        expect(getStationIconId(StationType.HEARD, signal)).not.toBe(
            getStationIconId(
                StationType.HEARD,
                getStationSignal(StationType.HEARD, -20),
            ),
        );
    });

    it("leaves CQ stations the color of their type", () => {
        const signal = getStationSignal(StationType.CQ, 5);
        expect(signal).toBeUndefined();
        expect(getStationColor(StationType.CQ, signal)).toBe(
            STATION_COLORS[StationType.CQ],
        );
    });
});
