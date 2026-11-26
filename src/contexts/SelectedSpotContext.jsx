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

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { useSpotData } from "./SpotDataContext";

const SelectedSpotContext = createContext(null);

export function SelectedSpotProvider({ children }) {
    const [selectedId, setSelectedId] = useState();

    //bumped when a spot is explicitly chosen (a table click), so the map can
    //fit the path to it. Hover selection doesn't do this, since the map would
    //jump around as the mouse moves over the table.
    const [focusRequest, setFocusRequest] = useState(null);

    const { filteredSpots } = useSpotData();

    const selectedSpot = filteredSpots.find((s) => s.id === selectedId);

    //forget a selected spot once a filter hides it (or it is cleared), so it
    //doesn't come back selected when the filter is changed or reset
    if (selectedId !== undefined && !selectedSpot) setSelectedId(undefined);

    //only need to create once
    const setSelectedSpot = useCallback((spot) => setSelectedId(spot?.id), []);

    //WSJT-X station shown in the card, as { call, pinned }. The card shows
    //either a spot or a station, whichever was hovered last. Clicking a
    //station pins it, so it stays while the mouse moves to the Reply button
    const [station, setStation] = useState({});

    //like focusRequest, to bring a station clicked in the table into view
    const [stationFocus, setStationFocus] = useState(null);

    const hoverStation = useCallback((call) => {
        if (!call) return;
        setStation((prev) => (prev.pinned ? prev : { call, pinned: false }));
        setSelectedId(undefined);
    }, []);

    //with no call, clears the station
    const pinStation = useCallback((call) => {
        setStation(call ? { call, pinned: true } : {});
        if (call) setSelectedId(undefined);
    }, []);

    const unpinStation = useCallback(
        () => setStation((prev) => ({ ...prev, pinned: false })),
        [],
    );

    //pin a station and show it on the map. coordinates is optional
    const focusStation = useCallback(
        (call, coordinates) => {
            pinStation(call);
            setStationFocus((r) => ({ coordinates, n: (r?.n ?? 0) + 1 }));
        },
        [pinStation],
    );

    //a hovered spot replaces the station, unless it is pinned
    useEffect(() => {
        if (selectedSpot?.id) setStation((prev) => (prev.pinned ? prev : {}));
    }, [selectedSpot?.id]);

    const focusSpot = useCallback((spot) => {
        if (!spot) return;
        //clicking a spot in the table always shows it
        setStation({});
        setSelectedId(spot.id);
        setFocusRequest((r) => ({ id: spot.id, n: (r?.n ?? 0) + 1 }));
    }, []);

    return (
        <SelectedSpotContext.Provider
            value={{
                selectedSpot,
                setSelectedSpot,
                focusSpot,
                focusRequest,
                station,
                hoverStation,
                pinStation,
                unpinStation,
                focusStation,
                stationFocus,
            }}
        >
            {children}
        </SelectedSpotContext.Provider>
    );
}

export function useSelectedSpot() {
    return useContext(SelectedSpotContext);
}
