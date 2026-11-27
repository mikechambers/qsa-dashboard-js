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

//what the dashboard has selected, shown in the card, the table and the map.
//There is only ever one, as { key, pinned }. key is a table row key (see
//tableRows) for either a spot or a station heard by WSJT-X. Hovering previews
//something, clicking pins it so hovering doesn't replace it

const SPOT_PREFIX = "spot-";
const STATION_PREFIX = "station-";

export const spotKey = (sequence) => `${SPOT_PREFIX}${sequence}`;
export const stationKey = (call) => `${STATION_PREFIX}${call}`;

//undefined if key isn't for a spot
export const getSpotSequence = (key) =>
    key?.startsWith(SPOT_PREFIX)
        ? Number(key.slice(SPOT_PREFIX.length))
        : undefined;

//undefined if key isn't for a station
export const getStationCall = (key) =>
    key?.startsWith(STATION_PREFIX)
        ? key.slice(STATION_PREFIX.length)
        : undefined;

export const NO_SELECTION = Object.freeze({ key: undefined, pinned: false });

//the mouse is over something. Returns the same object if nothing changes, so
//that mouse moves don't rerender
export const hoverSelection = (selection, key) => {
    if (!key || selection.pinned || selection.key === key) return selection;

    return { key, pinned: false };
};

//something was clicked. With no key, clears the selection
export const pinSelection = (key) =>
    key ? { key, pinned: true } : NO_SELECTION;

//stays selected until something else is hovered
export const unpinSelection = (selection) =>
    selection.pinned ? { key: selection.key, pinned: false } : selection;
