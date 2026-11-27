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

import { useEffect, useMemo, useState } from "react";
import { STATION_REFRESH_MS } from "@/consts/config";
import { useSettings } from "@/contexts/SettingsContext";
import { useWsjtx } from "@/contexts/WsjtxContext";
import { Band } from "@/enums/Band";
import { ActiveStationsContext } from "@/hooks/useActiveStations";
import {
    getActiveStations,
    getWorkingCall,
    isMappable,
    withDistanceFrom,
} from "@/utils/activeStations";
import { gridToLocation } from "@/utils/geo";
import { gridStore, withKnownGrid } from "@/utils/gridStore";
import { isValidMaidenHeadGrid } from "@/utils/radio";

//works out the stations WSJT-X has heard, once for everything that shows
//them. Must be inside SettingsProvider and WsjtxProvider
export function ActiveStationsProvider({ children }) {
    const { settings } = useSettings();
    const { connected, status, heard } = useWsjtx();

    //recalculate now and then so CQs expire and ages stay current
    const [tick, setTick] = useState(0);
    const any = heard.length > 0;
    useEffect(() => {
        if (!any) return;

        const timer = setInterval(
            () => setTick((t) => t + 1),
            STATION_REFRESH_MS,
        );
        return () => clearInterval(timer);
    }, [any]);

    const band = status
        ? Band.fromFrequency(status.dialFrequency)
        : undefined;
    const myCall = status?.deCall;
    const workingCall = getWorkingCall(status);

    //a new array each tick, so that what uses it rerenders
    const stations = useMemo(() => {
        //our own grid, from the app's settings, which is where the map puts
        //home
        const home = isValidMaidenHeadGrid(settings.grid)
            ? gridToLocation(settings.grid)
            : undefined;

        //a station we have no grid for isn't shown anywhere, even one calling
        //us or being worked. WSJT-X covers those
        return getActiveStations(heard, {
            band,
            myCall,
            workingCall,
            live: connected,
        })
            .map((station) => ({
                ...station,
                decode: withDistanceFrom(
                    withKnownGrid(station.decode, gridStore, home),
                    home,
                ),
            }))
            .filter((station) => isMappable(station.decode));
    }, [heard, tick, connected, band, myCall, workingCall, settings.grid]);

    return (
        <ActiveStationsContext.Provider value={stations}>
            {children}
        </ActiveStationsContext.Provider>
    );
}
