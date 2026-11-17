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
    getTwilightGeoJSON,
    getNightGeoJSON,
    getDayGeoJSON,
    ElevationValue,
} from "@/utils/twilight";

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

setWorkerUrl(workerUrl);

const TWILIGHT_REFRESH_MS = 60_000;

const TWILIGHT_LINES = "TWILIGHT_LINES";
const NIGHT_PATH = "NIGHT_PATH";
const DAY_PATH = "DAY_PATH";

const TWILIGHT_PALETTE = {
    dark: {
        fill: "#1b2f7a",
        fillOpacity: 0, // night shading off in dark mode
        dayFill: "#ffffff",
        dayFillOpacity: 0.08,
        line: "#55555555",
        lineWidth: 1.0,
        lineOpacity: [
            "match",
            ["get", "elevation"],
            0,
            1,
            -6,
            0.9,
            -12,
            0.8,
            0.6,
        ],
    },
    light: {
        fill: "#000000",
        fillOpacity: 0.1,
        dayFill: "#ffffff",
        dayFillOpacity: 0, //day off in light mode
        line: "#AAAAAA55",
        lineWidth: 1,
        lineOpacity: [
            "match",
            ["get", "elevation"],
            0,
            0.9,
            -6,
            0.7,
            -12,
            0.6,
            0.45,
        ],
    },
};

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

    //update greyline position once a minute
    useEffect(() => {
        const timer = setInterval(() => {
            if (!settings.showGreyline) {
                return;
            }

            if (!map) return;

            const now = new Date();

            map.getSource(TWILIGHT_LINES)?.setData(
                getTwilightGeoJSON(now, settings.elevationValues),
            );
            map.getSource(NIGHT_PATH)?.setData(
                getNightGeoJSON(now, settings.elevationValues),
            );
            map.getSource(DAY_PATH)?.setData(
                getDayGeoJSON(now, settings.elevationValues),
            );
        }, TWILIGHT_REFRESH_MS);

        return () => clearInterval(timer);
    }, [map, settings.showGreyline]);

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

        if (settings.showGreyline) {
            const p =
                settings.displayMode === DisplayMode.DARK
                    ? TWILIGHT_PALETTE.dark
                    : TWILIGHT_PALETTE.light;

            const now = new Date();
            /*
                const beforeId = map.getLayer(SPOT_PATH)
                    ? SPOT_PATH
                    : undefined;
*/
            /******** GREYLINE DAY LAYER ***********/
            map.addSource(DAY_PATH, {
                type: "geojson",
                data: getDayGeoJSON(now, settings.elevationValues),
            });

            map.addLayer(
                {
                    id: DAY_PATH,
                    type: "fill",
                    source: DAY_PATH,
                    paint: {
                        "fill-color": p.dayFill,
                        "fill-opacity": p.dayFillOpacity,
                        "fill-antialias": false,
                    },
                },
                // beforeId,
            );

            /******** GREYLINE NIGHT LAYER ***********/
            map.addSource(NIGHT_PATH, {
                type: "geojson",
                data: getNightGeoJSON(now, settings.elevationValues),
            });
            map.addLayer(
                {
                    id: NIGHT_PATH,
                    type: "fill",
                    source: NIGHT_PATH,
                    paint: {
                        "fill-color": p.fill,
                        "fill-opacity": p.fillOpacity,
                        "fill-antialias": false,
                    },
                },
                //beforeId,
            );

            /******** GREYLINE LINES LAYER ***********/
            map.addSource(TWILIGHT_LINES, {
                type: "geojson",
                data: getTwilightGeoJSON(now, settings.elevationValues),
            });
            map.addLayer(
                {
                    id: TWILIGHT_LINES,
                    type: "line",
                    source: TWILIGHT_LINES,
                    paint: {
                        "line-color": p.line,
                        "line-width": [
                            "match",
                            ["get", "elevation"],
                            0,
                            p.lineWidth + 1,
                            p.lineWidth,
                        ],
                        "line-opacity": p.lineOpacity,
                    },
                },
                //beforeId,
            );
        }
        /******* End Grey Line  **************/

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
