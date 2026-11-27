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

//the teardrop markers for stations WSJT-X is hearing. Drawn once here, and
//used both on the map and in the map buttons
import { SignalColor } from "@/enums/SignalColors";
import { StationType } from "@/enums/StationType";
import { STATION_COLORS } from "./config";

export const ICON_WIDTH = 24;
export const ICON_HEIGHT = 30;
//space under the tip, for the white outline
export const ICON_PADDING = 2;
//draw larger than shown, so they stay sharp
const PIXEL_RATIO = 3;

//tip at 0,0
const TEARDROP =
    "M0 0C-5 -7 -10 -11 -10 -17A10 10 0 1 1 10 -17C10 -11 5 -7 0 0Z";

//heard stations are colored by how strong their signal is, on the same scale
//as spots. Returns the SignalColor name, or undefined for other types
export const getStationSignal = (type, snr) =>
    type === StationType.HEARD ? SignalColor.getNameForSNR(snr) : undefined;

//signal is from getStationSignal. Without one, it is the color of the type
export const getStationColor = (type, signal) =>
    signal ? SignalColor.getColor(signal) : STATION_COLORS[type];

export const getStationIconId = (type, signal) =>
    signal ? `station-${type}-${signal}` : `station-${type}`;

const drawIcon = (type, signal) => {
    const canvas = document.createElement("canvas");
    canvas.width = ICON_WIDTH * PIXEL_RATIO;
    canvas.height = ICON_HEIGHT * PIXEL_RATIO;

    const ctx = canvas.getContext("2d");
    ctx.scale(PIXEL_RATIO, PIXEL_RATIO);
    ctx.translate(ICON_WIDTH / 2, ICON_HEIGHT - ICON_PADDING);

    const teardrop = new Path2D(TEARDROP);
    ctx.fillStyle = getStationColor(type, signal);
    ctx.fill(teardrop);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1.8;
    ctx.lineJoin = "round";
    ctx.stroke(teardrop);

    ctx.fillStyle = "white";
    if (type === StationType.CQ) {
        ctx.font = "bold 10px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("CQ", 0, -16.5);
    } else {
        ctx.beginPath();
        ctx.arc(0, -17, 3.5, 0, Math.PI * 2);
        ctx.fill();
    }

    return canvas;
};

export const getStationIconURL = (type, signal) =>
    drawIcon(type, signal).toDataURL();

export function addStationIcons(map) {
    const icons = [
        [StationType.CQ],
        ...SignalColor.cases.map((signal) => [StationType.HEARD, signal]),
    ];

    for (const [type, signal] of icons) {
        const canvas = drawIcon(type, signal);

        map.addImage(
            getStationIconId(type, signal),
            canvas
                .getContext("2d")
                .getImageData(0, 0, canvas.width, canvas.height),
            { pixelRatio: PIXEL_RATIO },
        );
    }
}
