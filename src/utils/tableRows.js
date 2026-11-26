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

//the rows of the table: PSK Reporter spots and stations heard by WSJT-X

import { StationType, STATION_TYPE_LIST } from "@/enums/StationType";
import { TableTab } from "@/enums/TableTab";

const spotRow = (spot) => ({
    key: `spot-${spot.sequence}`,
    type: StationType.SPOT,
    call: spot.receiverCall,
    countryCode: spot.receiverDXCC?.countryCode,
    distance: spot.distance,
    band: spot.band,
    frequency: spot.frequency,
    date: spot.date,
    spot,
});

//station is from getActiveStations
const stationRow = ({ type, decode }) => ({
    key: `station-${decode.call}`,
    type,
    call: decode.call,
    countryCode: decode.dxcc?.countryCode,
    distance: decode.distance,
    band: decode.band,
    //without a band, there is no radio frequency to show
    frequency: decode.band ? decode.frequency : undefined,
    date: decode.receivedAt,
    decode,
});

//show is the type filter, { [StationType]: boolean }. The rows of the types
//it has on, newest first
export function getTableRows(spots, stations, show) {
    return [...spots.map(spotRow), ...stations.map(stationRow)]
        .filter((row) => show[row.type])
        .sort((a, b) => b.date - a.date);
}

//how many rows each tab would have, whatever the type filter is set to
export function getTabCounts(spots, stations) {
    const ofType = (type) => stations.filter((s) => s.type === type).length;

    return {
        [TableTab.ALL]: spots.length + stations.length,
        [TableTab.SPOTS]: spots.length,
        [TableTab.HEARD]: ofType(StationType.HEARD),
        [TableTab.CQ]: ofType(StationType.CQ),
    };
}

//the tab matching the type filter. undefined for a mix that no tab has (which
//the map buttons can pick)
export function getSelectedTab(show) {
    const on = STATION_TYPE_LIST.filter((type) => show[type]);

    if (on.length === STATION_TYPE_LIST.length) return TableTab.ALL;
    if (on.length === 1) return on[0];
}

//the type filter that picking a tab sets
export const getTabFilter = (tab) =>
    Object.fromEntries(
        STATION_TYPE_LIST.map((type) => [
            type,
            tab === TableTab.ALL || tab === type,
        ]),
    );

//short age, to fit under a callsign: "8s", "2m", "3h", "1d"
export function shortAge(date, now = Date.now()) {
    const seconds = Math.max(0, Math.floor((now - date.getTime()) / 1000));

    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
}
