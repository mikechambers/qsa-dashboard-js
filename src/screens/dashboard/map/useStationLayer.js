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
import greatCircle from "@turf/great-circle";
import { StationType } from "@/enums/StationType";
import { STATION_LINE_PATH, STATION_PATH } from "./config";
import { getStationMapCoordinates } from "./spotCoordinates";
import { getStationIconId, getStationSignal } from "./stationIcons";

//which is drawn on top where they overlap
const getOrder = ({ type, working, callingYou }) => {
    if (working) return 3;
    if (callingYou) return 2;
    return type === StationType.CQ ? 1 : 0;
};

//hook that draws the stations from getActiveStations, with lines from home to
//those calling us or being worked
export function useStationLayer(map, ready, stations, location) {
    const getIcon = ({ type, decode }) =>
        getStationIconId(type, getStationSignal(type, decode.snr));

    //only redraw when a station is added, removed, moves or changes
    const key = stations
        .map((station) => {
            const { decode, working, callingYou } = station;
            return `${decode.call}:${decode.location.grid}:${getIcon(station)}:${working}:${callingYou}`;
        })
        .join(",");

    useEffect(() => {
        if (!map || !ready) return;

        map.getSource(STATION_PATH)?.setData({
            type: "FeatureCollection",
            features: stations.map((station) => ({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: getStationMapCoordinates(station.decode),
                },
                properties: {
                    call: station.decode.call,
                    icon: getIcon(station),
                    order: getOrder(station),
                },
            })),
        });
    }, [map, ready, key]);

    useEffect(() => {
        if (!map || !ready) return;

        const lines = location
            ? stations.filter((s) => s.working || s.callingYou)
            : [];

        map.getSource(STATION_LINE_PATH)?.setData({
            type: "FeatureCollection",
            features: lines.map(({ decode, working }) =>
                greatCircle(
                    location.coordinates,
                    getStationMapCoordinates(decode),
                    { npoints: 64, properties: { working } },
                ),
            ),
        });
    }, [map, ready, key, location?.id]);
}
