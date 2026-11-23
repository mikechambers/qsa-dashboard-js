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

import { createContext, useCallback, useContext, useState } from "react";
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

    //only need to create once
    const setSelectedSpot = useCallback((spot) => setSelectedId(spot?.id), []);

    const focusSpot = useCallback((spot) => {
        if (!spot) return;
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
            }}
        >
            {children}
        </SelectedSpotContext.Provider>
    );
}

export function useSelectedSpot() {
    return useContext(SelectedSpotContext);
}
