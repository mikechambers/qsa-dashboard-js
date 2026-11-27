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

import { useEffect } from "react";
import { useSelectedSpot } from "@/contexts/SelectedSpotContext";
import { useShownStations } from "@/hooks/useStations";
import { stationRow } from "@/utils/tableRows";
import { getStationCall } from "@/utils/selection";
import { useStationLayer } from "./useStationLayer";

//stations heard by WSJT-X. Draws nothing in the web version, as there are no
//decodes. A separate component so that new decodes don't rerender the whole
//map
export const StationLayer = ({ map, ready, location }) => {
    const { selectedKey, pin } = useSelectedSpot();
    const stations = useShownStations();

    useStationLayer(map, ready, stations, location);

    //don't show a hidden (or cleared) station again if it comes back later
    const gone =
        getStationCall(selectedKey) !== undefined &&
        !stations.some((s) => stationRow(s).key === selectedKey);

    useEffect(() => {
        if (gone) pin(undefined);
    }, [gone, pin]);

    return null;
};
