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

import { useSpotData } from "@/contexts/SpotDataContext";
import { ALL_CASES } from "@/consts";
import { getColorForBand } from "../spots/BandBadge";

export const getBandColorVar = (band) =>
    `var(--mantine-color-${getColorForBand(band)}-6)`;

//the band being filtered to, if any. toggle filters to a band, or clears the
//filter if it is already the one
export const useBandFilter = () => {
    const { filter, setFilter } = useSpotData();
    const selected = filter.band === ALL_CASES ? null : filter.band;

    const toggle = (band) =>
        setFilter(filter.with({ band: band === selected ? ALL_CASES : band }));

    return { selected, toggle };
};
