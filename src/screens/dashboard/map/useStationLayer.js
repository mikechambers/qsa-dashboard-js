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

import { useEffect, useRef } from "react";
import greatCircle from "@turf/great-circle";
import { getJitteredCoordinates } from "@/utils/geo";
import { ADD_SPOT_JITTER } from "@/consts/config";
import { StationType } from "@/enums/StationType";
import { STATION_LINE_PATH, STATION_PATH } from "./config";
import { getStationIconId } from "./stationIcons";

//turns a callsign into a number, so a station is always jittered the same way
const hashCall = (call) =>
    [...call].reduce((hash, c) => (hash * 31 + c.charCodeAt(0)) | 0, 0);

export const getStationMapCoordinates = ({ call, location }) =>
    ADD_SPOT_JITTER
        ? getJitteredCoordinates(location, hashCall(call))
        : location.coordinates;

//which is drawn on top where they overlap
const getOrder = ({ type, working, callingYou }) => {
    if (working) return 3;
    if (callingYou) return 2;
    return type === StationType.CQ ? 1 : 0;
};

//hook that draws the stations from getActiveStations, with lines from home to
//those calling us or being worked. onHover is called with the callsign under
//the mouse. onClick is called with the callsign clicked (or tapped), or
//undefined for a click anywhere else
export function useStationLayer(
    map,
    ready,
    stations,
    location,
    onHover,
    onClick,
) {
    const hoverRef = useRef(onHover);
    const clickRef = useRef(onClick);

    useEffect(() => {
        hoverRef.current = onHover;
        clickRef.current = onClick;
    }, [onHover, onClick]);

    //only redraw when a station is added, removed, moves or changes
    const key = stations
        .map(
            ({ type, decode, working, callingYou }) =>
                `${decode.call}:${decode.location.grid}:${type}:${working}:${callingYou}`,
        )
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
                    icon: getStationIconId(station.type),
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

    useEffect(() => {
        if (!map || !ready) return;

        const handleClick = (e) => {
            if (!map.getLayer(STATION_PATH)) return;

            const [hit] = map.queryRenderedFeatures(e.point, {
                layers: [STATION_PATH],
            });
            clickRef.current(hit?.properties.call);
        };

        //mousemove (not just mouseenter) so moving straight from one station
        //to a neighboring one still updates the details
        const handleHover = (e) => {
            hoverRef.current(e.features[0]?.properties.call);
        };

        const onEnter = () => {
            map.getCanvas().style.cursor = "pointer";
        };
        const onLeave = () => {
            map.getCanvas().style.cursor = "";
        };

        map.on("click", handleClick);
        map.on("mouseenter", STATION_PATH, onEnter);
        map.on("mousemove", STATION_PATH, handleHover);
        map.on("mouseleave", STATION_PATH, onLeave);

        return () => {
            map.off("click", handleClick);
            map.off("mouseenter", STATION_PATH, onEnter);
            map.off("mousemove", STATION_PATH, handleHover);
            map.off("mouseleave", STATION_PATH, onLeave);
        };
    }, [map, ready]);
}
