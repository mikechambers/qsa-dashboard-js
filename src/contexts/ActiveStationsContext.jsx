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

import { useEffect, useState } from "react";
import { useWsjtx } from "@/contexts/WsjtxContext";
import { Band } from "@/enums/Band";
import { ActiveStationsContext } from "@/hooks/useActiveStations";
import {
    getActiveStations,
    getWorkingCall,
    isMappable,
} from "@/utils/activeStations";
import { gridToLocation } from "@/utils/geo";
import { gridStore, withKnownGrid } from "@/utils/gridStore";
import { isValidMaidenHeadGrid } from "@/utils/radio";

//how often to check for expired stations
const REFRESH_MS = 5000;

//works out which stations WSJT-X is hearing, on the band it is on, once for
//everything that shows them. Must be inside WsjtxProvider
export function ActiveStationsProvider({ children }) {
    const { connected, status, decodes } = useWsjtx();

    //rerender now and then so old stations drop off
    const [, setTick] = useState(0);
    useEffect(() => {
        if (!connected) return;

        const timer = setInterval(() => setTick((t) => t + 1), REFRESH_MS);
        return () => clearInterval(timer);
    }, [connected]);

    //our own grid, as set in WSJT-X
    const home =
        status?.deGrid && isValidMaidenHeadGrid(status.deGrid)
            ? gridToLocation(status.deGrid)
            : undefined;

    //not memoized on purpose. Stations expire with time, and a new array each
    //tick also rerenders what uses it, which keeps ages like "20s ago" current
    //a station we have no grid for isn't shown anywhere, even one calling us
    //or being worked. WSJT-X covers those
    const stations = connected
        ? getActiveStations(decodes, {
              band: status && Band.fromFrequency(status.dialFrequency),
              myCall: status?.deCall,
              workingCall: getWorkingCall(status),
          })
              .map((station) => ({
                  ...station,
                  decode: withKnownGrid(station.decode, gridStore, home),
              }))
              .filter((station) => isMappable(station.decode))
        : [];

    return (
        <ActiveStationsContext.Provider value={stations}>
            {children}
        </ActiveStationsContext.Provider>
    );
}
