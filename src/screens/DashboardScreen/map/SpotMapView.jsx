import { useEffect, useRef } from "react";
import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";

import { IconCurrentLocation } from "@tabler/icons-react";
import { ActionIcon } from "@mantine/core";
import { useSettings } from "../../../context/SettingsContext";
import { DisplayMode } from "../../../enums/DisplayMode";
import { SNRKeyView } from "../SNRKeyView";

import {
    EMPTY,
    LOCATION_COLOR,
    CONNECTION_LINE_PATH,
    SPOT_PATH,
    CONNECTION_POINT,
    CIRCLE_RADIUS,
    CIRCLE_STROKE,
    DEFAULT_ZOOM,
} from "./config";

import { useMapInstance } from "./useMapInstance";
import { useHomeMarker } from "./useHomeMarker";
import { useSpotLayer } from "./useSpotsLayer";
import { useSelectedSpot } from "./useSelectedSpot";
import { addGreylineLayers } from "./greylineLayers";

setWorkerUrl(workerUrl);

const TWILIGHT_REFRESH_MS = 60_000;

const TWILIGHT_LINES = "TWILIGHT_LINES";
const NIGHT_PATH = "NIGHT_PATH";
const DAY_PATH = "DAY_PATH";

export const SpotMapView = ({
    spots,
    selectedSpot,
    onSpotHighlight,
    location,
}) => {
    const { settings } = useSettings();

    const mapContainer = useRef(null);
    const { map, ready } = useMapInstance(mapContainer, {
        style: `https://styles.maptoolkit.org/${
            settings.displayMode === DisplayMode.DARK ? "dark" : "light"
        }.json`,
        center: [-122.38, 37.58],
        zoom: DEFAULT_ZOOM,
    });

    useHomeMarker(map, location);

    useEffect(() => {
        if (!map || !ready || !settings.showGreyline) return;

        const timer = setInterval(
            () => updateGreyline(map, settings),
            TWILIGHT_REFRESH_MS,
        );
        return () => clearInterval(timer);
    }, [map, ready, settings.showGreyline, settings.elevationValues]);

    //center and zoom on home location
    const centerOnLocation = () => {
        if (!map || !location) {
            return;
        }

        //todo: pass in zoom option (maybe default)
        map.flyTo({
            center: location.coordinates,
            zoom: 4,
        });
    };

    //initial load
    useEffect(() => {
        if (!ready) return;

        addGreylineLayers(map, settings);

        /******** SPOTS LAYER ***********/
        map.addSource(SPOT_PATH, {
            type: "geojson",
            data: EMPTY,
            promoteId: "spotId",
        });

        map.addLayer({
            id: SPOT_PATH,
            source: SPOT_PATH,
            type: "circle",
            paint: {
                "circle-radius": CIRCLE_RADIUS,
                "circle-color": ["get", "color"],
                "circle-stroke-width": CIRCLE_STROKE,
                "circle-stroke-color": "white",
            },
        });

        /******** CONNECTION LINE LAYER ***********/
        map.addSource(CONNECTION_LINE_PATH, {
            type: "geojson",
            data: EMPTY,
        });

        //create the layer we draw the line into. default with nothing.
        map.addLayer({
            id: CONNECTION_LINE_PATH,
            type: "line",
            layout: { "line-cap": "round" },
            source: CONNECTION_LINE_PATH,
            paint: {
                "line-color": LOCATION_COLOR,
                "line-width": 2,
                "line-opacity": 1.0,
                "line-dasharray": [2, 2],
            },
        });

        /******** CONNECTION POINT LAYER ***********/
        map.addSource(CONNECTION_POINT, {
            type: "geojson",
            data: EMPTY,
        });

        map.addLayer({
            id: CONNECTION_POINT,
            source: CONNECTION_POINT,
            type: "circle",
            paint: {
                "circle-radius": 4,
                "circle-color": LOCATION_COLOR,
                "circle-stroke-width": 0,
            },
        });
    }, [ready]);

    useSelectedSpot(map, ready, selectedSpot, location);
    useSpotLayer(map, ready, spots, onSpotHighlight);

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
            <SNRKeyView
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
