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

import { useSettings } from "@/contexts/SettingsContext";
import { useSpotData } from "@/contexts/SpotDataContext";
import { useWsjtx } from "@/contexts/WsjtxContext";
import { StationType } from "@/enums/StationType";

//the filter on type (spot, heard, CQ). It is the same settings as the map's
//toggle buttons and the table's tabs. Only on desktop, as the web version only has spots
export function useTypeFilter() {
    const { settings, setShowSpotMarkers, setShowHeard, setShowCQ } =
        useSettings();
    const { filteredSpots } = useSpotData();
    const { available } = useWsjtx();

    const spotsHidden = available && !settings.showSpotMarkers;

    //set all three at once, from { [StationType]: boolean }
    const setShow = (show) => {
        setShowSpotMarkers(show[StationType.SPOT]);
        setShowHeard(show[StationType.HEARD]);
        setShowCQ(show[StationType.CQ]);
    };

    return {
        available,
        show: {
            [StationType.SPOT]: settings.showSpotMarkers,
            [StationType.HEARD]: settings.showHeard,
            [StationType.CQ]: settings.showCQ,
        },
        setShow,
        isFiltered:
            available &&
            !(
                settings.showSpotMarkers &&
                settings.showHeard &&
                settings.showCQ
            ),
        reset: () =>
            setShow({
                [StationType.SPOT]: true,
                [StationType.HEARD]: true,
                [StationType.CQ]: true,
            }),
        //the spots to list and count
        shownSpots: spotsHidden ? [] : filteredSpots,
    };
}
