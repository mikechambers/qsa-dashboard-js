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

import { TimeMode } from "../enums/TimeMode";

export const epochToDate = (epoch) => {
    if (epoch == null) {
        return null;
    }

    return new Date(epoch * 1000);
};

export const getShortTimeZoneName = (timeMode) => {
    if (!timeMode || timeMode === TimeMode.UTC) {
        return "UTC";
    }

    const parts = new Intl.DateTimeFormat("en-US", {
        timeZoneName: "short",
    }).formatToParts(new Date());

    return parts.find((part) => part.type === "timeZoneName")?.value ?? "";
};

//todo: could make this more general and re-usable
export function timeAgo(date) {
    if (!date) return "";

    const secondsElapsed = Math.floor(
        (Date.now() - new Date(date).getTime()) / 1000,
    );

    const intervals = [
        { label: "days", seconds: 86400 },
        { label: "hour", seconds: 3600 },
        { label: "minute", seconds: 60 },
        { label: "second", seconds: 1 },
    ];

    const rtf = new Intl.RelativeTimeFormat("en", {
        numeric: "auto",
        style: "narrow",
    });

    for (const interval of intervals) {
        const count = Math.floor(secondsElapsed / interval.seconds);
        if (count >= 1) {
            return rtf.format(-count, interval.label);
        }
    }

    return rtf.format(0, "second");
}
