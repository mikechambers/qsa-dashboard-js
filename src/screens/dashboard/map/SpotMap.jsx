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
import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";

import { IconCurrentLocation } from "@tabler/icons-react";
import { ActionIcon } from "@mantine/core";
import { useSettings } from "@/contexts/SettingsContext";
import { StationType } from "@/enums/StationType";
import { useShownTypes } from "@/hooks/useTypeFilter";
import { useWsjtx } from "@/contexts/WsjtxContext";
import { SNRLegend } from "./SNRKey";
import { MapControls } from "./MapControls";

import { DEFAULT_ZOOM } from "./config";
import { getMapStyle } from "./mapStyle";

import { useMapInstance } from "./useMapInstance";
import { useHomeMarker } from "./useHomeMarker";
import { useSpotLayer } from "./useSpotLayer";
import { SpotPopup } from "./SpotPopup";
import { StationLayer } from "./StationLayer";
import { SelectionLayer } from "./SelectionLayer";
import { useMapPointer } from "./useMapPointer";
import { fitPath } from "./mapView";
import { getSpotSequence } from "@/utils/selection";
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
import { useDistanceBands } from "./useDistanceBands";
import { useSpotData } from "@/contexts/SpotDataContext";
import { SPOT_PATH } from "./config";

//setup work for map library to do stuff on another threads
setWorkerUrl(workerUrl);

export const SpotMap = ({ spots, location }) => {
    const { settings, setShowSpotDetail } = useSettings();
    const {
        selectedKey,
        selectedSpot,
        selectedCall,
        pinned,
        hover,
        pin,
        unpin,
        focusRequest,
    } = useSelectedSpot();
    const { furthestSpot } = useSpotData();
    //without WSJT-X there are no type buttons, so spots are always shown
    const { available } = useWsjtx();
    const spotShownSetting = useShownTypes().show[StationType.SPOT];
    const spotsShown = !available || spotShownSetting;

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
    useSpotLayer(map, ready, spots);
    useMapPointer(map, ready, hover, pin);

    //the Spot toggle and type filter
    useEffect(() => {
        if (!map || !ready) return;

        map.setLayoutProperty(
            SPOT_PATH,
            "visibility",
            spotsShown ? "visible" : "none",
        );
        //don't leave a hidden spot selected
        if (!spotsShown && getSpotSequence(selectedKey) !== undefined) {
            pin(undefined);
        }
    }, [map, ready, spotsShown, pin]);

    //when something is clicked in the table, fit the path from home to it so
    //it (and its popup) is always in view, even if far away.
    useEffect(() => {
        const to = focusRequest?.coordinates;
        if (!map || !ready || !location || !to) return;

        fitPath(map, location.coordinates, to);
    }, [focusRequest]);

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
                stationCall={selectedCall}
                onUnpin={pinned ? unpin : undefined}
                open={settings.showSpotDetail}
                onOpenChange={setShowSpotDetail}
            />

            <MapControls />
            <MapLineKey />

            <StationLayer map={map} ready={ready} location={location} />
            <SelectionLayer map={map} ready={ready} location={location} />

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
