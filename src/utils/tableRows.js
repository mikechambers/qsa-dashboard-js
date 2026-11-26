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

//a row is the same shape whether it came from a Spot or a Decode, so that
//what shows one doesn't need to know which:
//
//  key, type, call, date
//  dxcc, countryCode, location (has the grid), distance
//  approximate: location and distance are only the middle of their country
//  band, frequency, mode
//  snr: of the report this row itself is, which is also in one of
//  theyHearYou / youHearThem, as { snr, date }
//
//spot or decode is the original, for what only one of them can do

export const spotRow = (spot) => ({
    key: `spot-${spot.sequence}`,
    type: StationType.SPOT,
    call: spot.receiverCall,
    date: spot.date,
    dxcc: spot.receiverDXCC,
    countryCode: spot.receiverDXCC?.countryCode,
    location: spot.receiverLocation,
    distance: spot.distance,
    approximate: false,
    band: spot.band,
    frequency: spot.frequency,
    mode: spot.mode,
    snr: spot.snr,
    theyHearYou: { snr: spot.snr, date: spot.date },
    spot,
});

//station is from getActiveStations
export const stationRow = ({ type, decode }) => ({
    key: `station-${decode.call}`,
    type,
    call: decode.call,
    date: decode.receivedAt,
    dxcc: decode.dxcc,
    countryCode: decode.dxcc?.countryCode,
    location: decode.location,
    distance: decode.distance,
    approximate: decode.locationSource === "country",
    band: decode.band,
    //without a band, there is no radio frequency to show
    frequency: decode.band ? decode.frequency : undefined,
    mode: decode.mode,
    snr: decode.snr,
    youHearThem: { snr: decode.snr, date: decode.receivedAt },
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
