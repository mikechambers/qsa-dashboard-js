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
import { LngLatBounds, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";

import { IconCurrentLocation } from "@tabler/icons-react";
import { ActionIcon } from "@mantine/core";
import { useSettings } from "@/contexts/SettingsContext";
import { SNRLegend } from "./SNRKey";
import { MapControls } from "./MapControls";

import { DEFAULT_ZOOM } from "./config";
import { getMapStyle } from "./mapStyle";

import { useMapInstance } from "./useMapInstance";
import { useHomeMarker } from "./useHomeMarker";
import { useSpotLayer } from "./useSpotLayer";
import { useSelectedSpotMarker } from "./useSelectedSpotMarker";
import { SpotPopup } from "./SpotPopup";
import { StationLayer } from "./StationLayer";
import { MapLineKey } from "./MapLineKey";

import { addGreylineLayers } from "./greylineLayers";
import { useGreyline } from "./useGreyline";

import {
    addConnectionLineLayer,
    addConnectionPointLayer,
    addStationLayer,
    addStationLineLayers,
    addSpotLayer,
} from "./spotLayers";

import { useSelectedSpot } from "../../../contexts/SelectedSpotContext";
import { useSpotHighlightEffects } from "./useSpotHighlightEffects";
import { useDistanceBands } from "./useDistanceBands";
import { useSpotData } from "@/contexts/SpotDataContext";
import { SELECTED_STATION_PATH, SPOT_PATH } from "./config";

//setup work for map library to do stuff on another threads
setWorkerUrl(workerUrl);

//how long the mouse rests on a table row before an off-map spot is brought into view
const HOVER_FIT_DELAY_MS = 350;

//rough size of the area the popup card covers, at the top right of the map
const POPUP_AREA = { width: 360, openHeight: 260, closedHeight: 56 };

//is the point on screen, and not hidden behind the popup?
const isInView = (map, [lng, lat], detailOpen) => {
    //the map can show several copies of the world, so use the one nearest the center
    const centerLng = map.getCenter().lng;
    const wrappedLng = centerLng + ((((lng - centerLng + 180) % 360) + 360) % 360) - 180;

    const { x, y } = map.project([wrappedLng, lat]);
    const { clientWidth: w, clientHeight: h } = map.getContainer();
    const margin = 30;

    //the popup covers the top right of the map
    const popupHeight = detailOpen
        ? POPUP_AREA.openHeight
        : POPUP_AREA.closedHeight;
    if (x > w - POPUP_AREA.width && y < popupHeight) return false;

    return x > margin && x < w - margin && y > margin && y < h - margin;
};

//zoom the map to show the path from home to a spot
const fitPath = (map, [fromLng, fromLat], [toLng, toLat]) => {
    //take the short way around the world
    if (toLng - fromLng > 180) toLng -= 360;
    else if (toLng - fromLng < -180) toLng += 360;

    const bounds = new LngLatBounds(
        [fromLng, fromLat],
        [fromLng, fromLat],
    ).extend([toLng, toLat]);

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;

    //extra room on top, so the spot isn't hidden behind the popup
    map.fitBounds(bounds, {
        padding: { top: 200, bottom: 50, left: 60, right: 60 },
        maxZoom: 6,
        duration: reduceMotion ? 0 : 800,
    });
};

export const SpotMap = ({ spots, location }) => {
    const { settings, setShowSpotDetail } = useSettings();
    const {
        selectedSpot,
        setSelectedSpot,
        focusRequest,
        station,
        hoverStation,
        pinStation,
        unpinStation,
        stationFocus,
    } = useSelectedSpot();
    const { furthestSpot } = useSpotData();

    const mapContainer = useRef(null);

    const startCoordinates = location?.coordinates ?? [-122.38, 37.58];

    //initialize map. Switching style based on light / dark mode
    const { map, ready } = useMapInstance(mapContainer, {
        getStyle: () => getMapStyle(settings.displayMode),
        center: startCoordinates,
        zoom: DEFAULT_ZOOM,
    });

    //setup home marker
    useHomeMarker(map, location);

    //initialize all the layers once the map has loaded
    useEffect(() => {
        if (!ready) return;

        //todo: could just pass in ready to these also, or dont pass into
        //use greyLine and the calls below
        addGreylineLayers(map, settings);
        addStationLineLayers(map);
        addSpotLayer(map);
        addConnectionLineLayer(map);
        //spots and stations each have a line, as both can be selected
        addConnectionLineLayer(map, SELECTED_STATION_PATH);
        addConnectionPointLayer(map);
        addStationLayer(map);
    }, [ready]);

    //todo: refactor others to combine initialization
    useDistanceBands(
        map,
        ready,
        location,
        furthestSpot?.distance,
        settings.displayMode,
        settings.unitType,
        settings.showDistanceOverlay && settings.showDistanceRings,
        settings.showDistanceOverlay && settings.showMaxDistance,
    );

    //draw items
    useGreyline(map, ready, settings);
    useSpotHighlightEffects(map, ready, selectedSpot, location);
    useSpotLayer(map, ready, spots, setSelectedSpot);

    //the Spot toggle and type filter
    useEffect(() => {
        if (!map || !ready) return;

        map.setLayoutProperty(
            SPOT_PATH,
            "visibility",
            settings.showSpotMarkers ? "visible" : "none",
        );
        //don't leave a hidden spot selected
        if (!settings.showSpotMarkers) setSelectedSpot(undefined);
    }, [map, ready, settings.showSpotMarkers, setSelectedSpot]);

    //selected spot ring / dot
    useSelectedSpotMarker(map, ready, selectedSpot);

    //when a spot is clicked in the table, fit the path from home to it so
    //the spot (and its popup) is always in view, even a far away one.
    useEffect(() => {
        const to = selectedSpot?.receiverLocation?.coordinates;
        if (!map || !ready || !focusRequest || !location || !to) return;

        fitPath(map, location.coordinates, to);
    }, [focusRequest]);

    //the same for a station clicked in the table
    useEffect(() => {
        const to = stationFocus?.coordinates;
        if (!map || !ready || !location || !to) return;

        fitPath(map, location.coordinates, to);
    }, [stationFocus]);

    //hovering a table row selects a spot, but if it is off the map there is
    //nothing to see. Once the mouse rests on the row for a moment, bring the
    //path into view. The delay keeps the map from swooping around while the
    //mouse passes over rows.
    useEffect(() => {
        const to = selectedSpot?.receiverLocation?.coordinates;
        if (!map || !ready || !location || !to) return;
        if (isInView(map, to, settings.showSpotDetail)) return;

        const timer = setTimeout(
            () => fitPath(map, location.coordinates, to),
            HOVER_FIT_DELAY_MS,
        );
        return () => clearTimeout(timer);
    }, [map, ready, selectedSpot?.id]);

    //center and zoom on home location
    const centerOnLocation = () => {
        if (!map || !location) {
            return;
        }

        map.flyTo({
            center: location.coordinates,
            zoom: 4,
        });
    };

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <div
                ref={mapContainer}
                style={{ width: "100%", height: "100%", borderRadius: "6px" }}
            />

            <ActionIcon
                variant="default"
                size="lg"
                aria-label="Center on my location"
                disabled={!location}
                onClick={centerOnLocation}
                style={{
                    position: "absolute",
                    bottom: 10,
                    left: 10,
                    zIndex: 1,
                }}
            >
                <IconCurrentLocation size={18} />
            </ActionIcon>
            <SpotPopup
                spot={selectedSpot}
                stationCall={station.call}
                onUnpin={station.pinned ? unpinStation : undefined}
                open={settings.showSpotDetail}
                onOpenChange={setShowSpotDetail}
            />

            <MapControls />
            <MapLineKey />

            <StationLayer
                map={map}
                ready={ready}
                location={location}
                selectedCall={station.call}
                onHover={hoverStation}
                onPin={pinStation}
            />

            <SNRLegend
                selectedSpot={selectedSpot}
                style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    zIndex: 1,
                }}
            />
        </div>
    );
};
