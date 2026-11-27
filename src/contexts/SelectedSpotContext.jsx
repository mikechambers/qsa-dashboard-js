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
import {
    NO_SELECTION,
    getSpotSequence,
    hoverSelection,
    pinSelection,
    unpinSelection,
} from "@/utils/selection";
import { useSpotData } from "./SpotDataContext";

const SelectedSpotContext = createContext(null);

//the one selected spot or station (see utils/selection). Only the key is kept
//here: station details change with every decode, so what needs them looks them
//up itself, rather than rerendering everything that uses this
export function SelectedSpotProvider({ children }) {
    const [selection, setSelection] = useState(NO_SELECTION);

    //bumped when something is explicitly chosen (a table click), so the map can
    //fit the path to it
    const [focusRequest, setFocusRequest] = useState(null);

    const { filteredSpots } = useSpotData();

    const sequence = getSpotSequence(selection.key);
    const selectedSpot =
        sequence === undefined
            ? undefined
            : filteredSpots.find((s) => s.sequence === sequence);

    //forget a selected spot once a filter hides it (or it is cleared), so it
    //doesn't come back selected when the filter is changed or reset
    if (sequence !== undefined && !selectedSpot) setSelection(NO_SELECTION);

    //preview what the mouse is over, unless something is pinned
    const hover = useCallback(
        (key) => setSelection((prev) => hoverSelection(prev, key)),
        [],
    );

    //with no key, clears the selection
    const pin = useCallback((key) => setSelection(pinSelection(key)), []);

    const unpin = useCallback(() => setSelection(unpinSelection), []);

    //pin and show it on the map. coordinates is optional
    const focus = useCallback(
        (key, coordinates) => {
            pin(key);
            setFocusRequest((r) => ({ coordinates, n: (r?.n ?? 0) + 1 }));
        },
        [pin],
    );

    return (
        <SelectedSpotContext.Provider
            value={{
                selectedKey: selection.key,
                pinned: selection.pinned,
                selectedSpot,
                hover,
                pin,
                unpin,
                focus,
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
