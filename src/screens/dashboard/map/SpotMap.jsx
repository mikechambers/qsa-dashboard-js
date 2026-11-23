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
import { createPortal } from "react-dom";
import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";

import { IconCurrentLocation } from "@tabler/icons-react";
import { ActionIcon } from "@mantine/core";
import { useSettings } from "@/contexts/SettingsContext";
import { DisplayMode } from "@/enums/DisplayMode";
import { SNRLegend } from "./SNRKey";

import { DEFAULT_ZOOM } from "./config";

import { useMapInstance } from "./useMapInstance";
import { useHomeMarker } from "./useHomeMarker";
import { useSpotLayer } from "./useSpotLayer";
import { useSelectedSpotMarker } from "./useSelectedSpotMarker";
import { SpotPopup } from "./SpotPopup";

import { addGreylineLayers } from "./greylineLayers";
import { useGreyline } from "./useGreyline";

import {
    addConnectionLineLayer,
    addConnectionPointLayer,
    addSpotLayer,
} from "./spotLayers";

import { useSelectedSpot } from "../../../contexts/SelectedSpotContext";
import { useSpotHighlightEffects } from "./useSpotHighlightEffects";
import { useDistanceBands } from "./useDistanceBands";
import { useSpotData } from "@/contexts/SpotDataContext";

//setup work for map library to do stuff on another threads
setWorkerUrl(workerUrl);

export const SpotMap = ({ spots, location }) => {
    const { settings } = useSettings();
    const { selectedSpot, setSelectedSpot } = useSelectedSpot();
    const { furthestSpot } = useSpotData();

    const mapContainer = useRef(null);
    const overlayRef = useRef(null);

    const startCoordinates = location?.coordinates ?? [-122.38, 37.58];

    //initialize map. Switching style based on light / dark mode
    const { map, ready } = useMapInstance(mapContainer, {
        style: `https://styles.maptoolkit.org/${
            settings.displayMode === DisplayMode.DARK ? "dark" : "light"
        }.json`,
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
        addSpotLayer(map);
        addConnectionLineLayer(map);
        addConnectionPointLayer(map);
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

    //selected spot ring / dot, with popup content portaled into the marker
    const popupContainer = useSelectedSpotMarker(
        map,
        ready,
        selectedSpot,
        overlayRef,
    );

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
            {/* popups render here so they sit above the legend and controls */}
            <div
                ref={overlayRef}
                style={{
                    position: "absolute",
                    inset: 0,
                    overflow: "hidden",
                    pointerEvents: "none",
                    zIndex: 2,
                    borderRadius: "6px",
                }}
            />

            {popupContainer &&
                selectedSpot &&
                createPortal(<SpotPopup spot={selectedSpot} />, popupContainer)}

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
