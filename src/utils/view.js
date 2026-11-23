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

import { UnitType } from "@/enums/UnitType";
import { kilometersToMiles } from "@/utils/geo";
import { TimeMode } from "../enums/TimeMode";
import { SignalColor } from "../enums/SignalColors";

const distanceFormatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
});

export const formatNumber = (n) => {
    return distanceFormatter.format(n);
};

export const convertAndFormatDistance = (km, unitType) => {
    const miles = unitType === UnitType.IMPERIAL;

    const d = formatNumber(miles ? kilometersToMiles(km) : km);

    return { d, unit: miles ? "mi" : "km" };
};

export const formatFrequency = (frequencyHz) => {
    if (
        typeof frequencyHz !== "number" ||
        Number.isNaN(frequencyHz) ||
        frequencyHz <= 0
    ) {
        return "";
    }

    const mhz = frequencyHz / 1_000_000;

    const decimals = 3;

    const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: false,
    }).format(mhz);

    return formatted;
};

export const formatTime = (date, timeMode, showSeconds = false) => {
    let time = "";

    if (!date) {
        return time;
    }

    time = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timeMode === TimeMode.UTC ? "UTC" : undefined,
        second: showSeconds ? "2-digit" : undefined,
        hourCycle: "h23",
    }).format(date);

    return time;
};

export const getCSSColorForSNR = (snr) => {
    return SignalColor.getColorForSNR(snr);
};

export const formatHMS = (total) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = Math.floor(total % 60);
    return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
};
