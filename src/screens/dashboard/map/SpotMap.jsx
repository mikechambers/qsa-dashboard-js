import { useEffect, useRef } from "react";
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

        //todo: would could just pass in ready to these also, or dont pass into
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
