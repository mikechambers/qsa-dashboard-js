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

//one number per band: how many rows, when it was last heard, average snr,
//and the furthest distance. Most rows first, ties go to the most recently heard.
//rows are from getTableRows
export const getBandStats = (rows) => {
    const stats = new Map();

    for (const row of rows) {
        if (!row.band) continue;

        let s = stats.get(row.band);
        if (!s) {
            s = {
                band: row.band,
                count: 0,
                spots: 0,
                snrTotal: 0,
                last: 0,
                furthest: 0,
            };
            stats.set(row.band, s);
        }

        s.count++;
        if (row.type === StationType.SPOT) s.spots++;
        s.snrTotal += row.snr ?? 0;
        s.last = Math.max(s.last, new Date(row.date).getTime() || 0);
        s.furthest = Math.max(s.furthest, row.distance ?? 0);
    }

    return [...stats.values()].sort(
        (a, b) => b.count - a.count || b.last - a.last,
    );
};

//what a band's count is of. Spots are reports (a station can have several),
//heard and CQ rows are stations, and a mix of the two is neither
export const getBandNoun = (stat) => {
    if (stat.spots > 0 && stat.spots < stat.count) return "entries";
    return stat.spots ? "spots" : "stations";
};

//the first max bands, always including the selected one
export const pickBands = (bands, max, selected) => {
    const shown = bands.slice(0, max);
    const picked = bands.find((b) => b.band === selected);

    if (picked && !shown.includes(picked)) shown[shown.length - 1] = picked;

    return shown;
};
