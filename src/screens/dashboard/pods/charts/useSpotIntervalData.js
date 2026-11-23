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

import { useEffect, useRef, useState } from "react";

const MINUTE = 60 * 1000;
const MINUTES = 30;

const median = (values) => {
    const a = [...values].sort((x, y) => x - y);
    const mid = Math.floor(a.length / 2);
    return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
};

const buildBuckets = (spots, now) => {
    //find the start of the oldest buck (30 minutes past).
    //first, get the start of the current minute
    // Math.floor(now / MINUTE) convert ms to seconds, and then drop remainder (floor) then convert back to minutes : (* MINUTE)
    //then go back 29 minutes - (MINUTES - 1) * MINUTE;
    //to find start slot
    const start = Math.floor(now / MINUTE) * MINUTE - (MINUTES - 1) * MINUTE;

    //create a new array with 30 slots
    const buckets = Array.from({ length: MINUTES }, () => null);

    for (const s of spots) {
        //figure out which bucket / slot this spot belongs in
        //time since the start, rounded down, in minutes
        const i = Math.floor((s.date.getTime() - start) / MINUTE);

        //if its older than the fisrt slot (30 mins), or in the future, then skip
        if (i < 0 || i >= MINUTES) continue;

        // bucket creation: add maxSnr
        const b = (buckets[i] ??= {
            count: 0,
            snrSum: 0,
            maxKm: 0,
            maxSnr: 0,
            kms: [],
        });

        b.count += 1;
        b.snrSum += s.snr;
        b.kms.push(s.distance);

        if (s.distance > b.maxKm) {
            b.maxKm = s.distance;
            b.maxSnr = s.snr;
        }
    }

    // convert all the data into final form, keeping null slots (for each minute_)
    return buckets.map(
        (b) =>
            b && {
                count: b.count,
                avgSnr: b.snrSum / b.count,
                maxKm: b.maxKm,
                maxSnr: b.maxSnr, // new
                medKm: median(b.kms),
            },
    );
};

export const useSpotIntervalData = (spots) => {
    //store a reference to always point at the current
    //spot (for the interval enclosure)
    const spotsRef = useRef(spots);
    spotsRef.current = spots;

    //where we store the interval data
    const [data, setData] = useState(() =>
        buildBuckets(spots ?? [], Date.now()),
    );

    //called on initialization
    useEffect(() => {
        //function to rebuild data using the latest spots
        const rebuild = () =>
            setData(buildBuckets(spotsRef.current ?? [], Date.now()));

        //run once
        rebuild();

        //start an interval to run once a minute
        const id = setInterval(rebuild, MINUTE);

        //clean up interval when unmounted
        return () => clearInterval(id);
    }, [spots]);

    return data;
};
