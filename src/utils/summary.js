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

import { isMappable } from "@/utils/activeStations";

//the numbers at the top of the dashboard. rows are from getTableRows (newest
//first), and myCall isn't counted as a station
export function getSummary(rows, myCall = "") {
    const me = myCall.toUpperCase();
    const calls = new Set();
    const countries = new Set();
    let furthest;

    for (const row of rows) {
        //a spot also has the station that was heard, which isn't always us
        for (const call of [row.call, row.spot?.senderCall]) {
            if (call && call !== me) calls.add(call);
        }

        if (row.countryCode) countries.add(row.countryCode);

        //the distance to the middle of a country is too rough to be a record
        if (row.distance === undefined) continue;
        if (row.decode && !isMappable(row.decode)) continue;
        if (!furthest || row.distance > furthest.distance) furthest = row;
    }

    return {
        furthest,
        mostRecent: rows[0],
        stationCount: calls.size,
        countryCount: countries.size,
    };
}
