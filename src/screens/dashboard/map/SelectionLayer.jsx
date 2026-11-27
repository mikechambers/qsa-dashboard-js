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
import { useSettings } from "@/contexts/SettingsContext";
import { useShownStations } from "@/hooks/useStations";
import { stationRow } from "@/utils/tableRows";
import { fitPath, isInView } from "./mapView";
import { getSelectionTarget } from "./selectionTarget";
import { useSelectionMarker } from "./useSelectionMarker";

//how long the mouse rests on a table row before something off the map is
//brought into view
const HOVER_FIT_DELAY_MS = 350;

//shows the selected spot or station on the map. Its own component, as is
//StationLayer, so that new decodes don't rerender the whole map
export const SelectionLayer = ({ map, ready, location }) => {
    const { settings } = useSettings();
    const { selectedKey, selectedSpot } = useSelectedSpot();
    const stations = useShownStations();

    const target = getSelectionTarget(
        selectedKey,
        selectedSpot,
        stations.find((s) => stationRow(s).key === selectedKey),
    );

    useSelectionMarker(map, ready, target, location);

    //hovering a table row selects something, but if it is off the map there is
    //nothing to see. Once the mouse rests on the row for a moment, bring the
    //path into view. The delay keeps the map from swooping around while the
    //mouse passes over rows.
    useEffect(() => {
        const to = target?.at;
        if (!map || !ready || !location || !to) return;
        //don't move the map out from under a mouse that is on it
        if (map.getContainer().matches(":hover")) return;
        if (isInView(map, to, settings.showSpotDetail)) return;

        const timer = setTimeout(
            () => fitPath(map, location.coordinates, to),
            HOVER_FIT_DELAY_MS,
        );
        return () => clearTimeout(timer);
    }, [map, ready, target?.key]);

    return null;
};
