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

import { useMemo } from "react";
import { useSpotData } from "@/contexts/SpotDataContext";
import { useActiveStations } from "@/hooks/useActiveStations";
import { useFilteredStations } from "@/hooks/useStations";
import { useTypeFilter } from "@/hooks/useTypeFilter";
import { StationType } from "@/enums/StationType";
import { ALL_CASES } from "@/consts";
import { getTableRows } from "@/utils/tableRows";
import { getSummary } from "@/utils/summary";

//what the summary shows, used by both the pods and the collapsed bar
export const useSummaryData = () => {
    const { filteredSpots, ageTick, spots, filter, activeCallsign } =
        useSpotData();

    //the bands ignore the band filter, so the other bands stay visible
    //(and clickable) while one is selected
    const bandSpots = useMemo(
        () => filter.with({ band: ALL_CASES }).filter(spots),
        [filter, spots, ageTick],
    );

    //it counts the types being viewed, the same as the table. The web version
    //only has spots
    const { available, show } = useTypeFilter();
    const stations = useFilteredStations();
    //as for spots, the bands ignore the band filter
    const bandStations = filter
        .with({ band: ALL_CASES })
        .filterStations(useActiveStations());
    const viewedTypes = available ? show : { [StationType.SPOT]: true };
    const bandRows = getTableRows(bandSpots, bandStations, viewedTypes);

    //the summary is of the same rows as the table
    const summary = getSummary(
        getTableRows(filteredSpots, stations, viewedTypes),
        activeCallsign,
    );

    return { available, bandSpots, bandStations, bandRows, summary };
};
