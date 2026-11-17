import { useEffect, useRef } from "react";
import { Map, Marker, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import MaplibreTransition from "maplibre-transition";

import greatCircle from "@turf/great-circle";

import { getCSSColorForSNR } from "@/utils/view";
import { IconCurrentLocation } from "@tabler/icons-react";
import { ActionIcon } from "@mantine/core";
import { useSettings } from "../../context/SettingsContext";
import { DisplayMode } from "../../enums/DisplayMode";
import { SNRKeyView } from "./SNRKeyView";

import {
    getTwilightGeoJSON,
    getNightGeoJSON,
    getDayGeoJSON,
    TWILIGHT,
} from "@/utils/twilight";

setWorkerUrl(workerUrl);

//empty featurecollection to use to clear layers
const EMPTY = { type: "FeatureCollection", features: [] };

const LOCATION_COLOR = "#1c7ed6";
const CONNECTION_LINE_PATH = "CONNECTION_LINE_PATH";
const SPOT_PATH = "SPOT_PATH";
const CONNECTION_POINT = "CONNECTION_POINT";

const CIRCLE_RADIUS = 6;
const CIRCLE_RADIUS_SELECTED = 18;
const CIRCLE_STROKE = 2;
const TRANSITION_DURATION_IN = 600;
const TRANSITION_DURATION_OUT = 300;
const EASING_TYPE = "bounce";
const DEFAULT_ZOOM = 3;

const TWILIGHT_REFRESH_MS = 60_000;

//todo: move to settings
const TWILIGHT_ELEVATIONS = [TWILIGHT.CIVIL, TWILIGHT.NAUTICAL];

const TWILIGHT_LINES = "TWILIGHT_LINES";
const NIGHT_PATH = "NIGHT_PATH";
const DAY_PATH = "DAY_PATH";

const TWILIGHT_PALETTE = {
    dark: {
        fill: "#1b2f7a",
        fillOpacity: 0, // night shading off in dark mode
        dayFill: "#fff4d6", // soft warm white
        dayFillOpacity: 0.08,
        line: "#ffc07800",
        lineWidth: 1.5,
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
        fillOpacity: 0.15,
        dayFill: "#ffffff",
        dayFillOpacity: 0,
        line: "#f08c0000",
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
    const mapInstance = useRef(null);

    //update greyline position once a minute
    useEffect(() => {
        const timer = setInterval(() => {
            const map = mapInstance.current;

            console.log("update");
            if (!map) return;

            const now = new Date();

            map.getSource(TWILIGHT_LINES)?.setData(
                getTwilightGeoJSON(now, TWILIGHT_ELEVATIONS),
            );
            map.getSource(NIGHT_PATH)?.setData(
                getNightGeoJSON(now, TWILIGHT_ELEVATIONS),
            );
            map.getSource(DAY_PATH)?.setData(
                getDayGeoJSON(now, TWILIGHT_ELEVATIONS),
            );
        }, TWILIGHT_REFRESH_MS);

        return () => clearInterval(timer);
    }, []);

    //center and zoom on home location
    const centerOnLocation = () => {
        if (!mapInstance.current || !location) {
            return;
        }

        //todo: pass in zoom option (maybe default)
        mapInstance.current.flyTo({
            center: location.coordinates,
            zoom: 4,
        });
    };

    //takes an element and adds to specified location
    const addMarkerToMap = (el, loc) => {
        const map = mapInstance.current;

        if (!map || !loc) return;

        const marker = new Marker({ element: el })
            .setLngLat([loc.longitude, loc.latitude])
            .addTo(map);

        return marker;
    };

    const drawConnectionLine = (spot) => {
        const src = mapInstance.current?.getSource(CONNECTION_LINE_PATH);
        if (!src || !location) {
            return;
        }

        const to = spot?.receiverLocation;

        src.setData(
            location && to
                ? greatCircle(location.coordinates, to.coordinates, {
                      npoints: 64,
                  })
                : EMPTY,
        );

        const pntSrc = mapInstance.current?.getSource(CONNECTION_POINT);

        if (!pntSrc) return;

        pntSrc.setData({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: to.coordinates,
            },
            properties: {},
        });
    };

    //initial load
    useEffect(() => {
        if (mapInstance.current) return;

        const displayMode =
            settings.displayMode === DisplayMode.DARK ? "dark" : "light";
        const url = `https://styles.maptoolkit.org/${displayMode}.json`;

        mapInstance.current = new Map({
            container: mapContainer.current,
            style: url,
            center: [-122.38, 37.58],
            zoom: DEFAULT_ZOOM,
        });

        //initialize animation library to animate spots
        MaplibreTransition.init(mapInstance.current);

        mapInstance.current.on("load", () => {
            const map = mapInstance.current;

            const p =
                settings.displayMode === DisplayMode.DARK
                    ? TWILIGHT_PALETTE.dark
                    : TWILIGHT_PALETTE.light;

            const now = new Date();
            const beforeId = map.getLayer(SPOT_PATH) ? SPOT_PATH : undefined;

            /******** GREYLINE DAY LAYER ***********/
            map.addSource(DAY_PATH, {
                type: "geojson",
                data: getDayGeoJSON(now, TWILIGHT_ELEVATIONS),
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
                beforeId,
            );

            /******** GREYLINE NIGHT LAYER ***********/
            map.addSource(NIGHT_PATH, {
                type: "geojson",
                data: getNightGeoJSON(now, TWILIGHT_ELEVATIONS),
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
                beforeId,
            );

            /******** GREYLINE LINES LAYER ***********/
            map.addSource(TWILIGHT_LINES, {
                type: "geojson",
                data: getTwilightGeoJSON(now, TWILIGHT_ELEVATIONS),
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
                beforeId,
            );

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

            map.on("mouseenter", SPOT_PATH, (e) => {
                const f = e.features[0];

                let s = spots.find((spot) => spot.id === f.properties.spotId);

                onSpotHighlight(s);
            });
        });
        return () => {
            mapInstance.current?.remove();
            mapInstance.current = null;
        };
    }, []);

    useEffect(() => {
        if (!location) {
            return;
        }

        //draw location spot with an html element to make it easier to constantly
        //animate
        const el = document.createElement("div");
        el.style.width = "20px";
        el.style.height = "20px";
        el.style.borderRadius = "50%";
        el.style.background = LOCATION_COLOR;
        el.style.border = "3px solid white";
        el.style.boxShadow =
            "0 0 0 4px rgba(28,126,214,0.3), 0 0 6px rgba(0,0,0,0.4)";

        //this links to css class which handles animation / pulsing
        el.className = "home-marker";

        const m = addMarkerToMap(el, location);

        return () => {
            if (m) m.remove();
        };
    }, [location]);

    //Redraw Spots when spots is updated
    useEffect(() => {
        let features = [];
        const map = mapInstance.current;

        if (!map) {
            return;
        }

        for (const s of spots) {
            const color = getCSSColorForSNR(s.snr);

            features.push({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: s.receiverLocation.coordinates,
                },
                properties: { color: color, spotId: s.id },
            });
        }

        const apply = () =>
            map.getSource(SPOT_PATH)?.setData({
                type: "FeatureCollection",
                features: features,
            });

        if (map.getSource(SPOT_PATH)) {
            apply();
        } else {
            map.once("load", apply);
            return () => map.off("load", apply);
        }
        return () => {};
    }, [spots]);

    //run when selected spot changes
    useEffect(() => {
        const map = mapInstance.current;
        if (!map || !selectedSpot) return;

        const feature = {
            id: selectedSpot.id,
            source: SPOT_PATH,
            layer: { id: SPOT_PATH },
        };

        //uses animation library
        map.transition(feature, {
            duration: TRANSITION_DURATION_IN,
            delay: 0,
            ease: EASING_TYPE,
            paint: { "circle-radius": [null, CIRCLE_RADIUS_SELECTED] },
        });

        drawConnectionLine(selectedSpot);

        return () => {
            const map = mapInstance.current;
            if (!map) return;

            //when new selected item, the transition to original size
            map.transition(feature, {
                duration: TRANSITION_DURATION_OUT,
                ease: EASING_TYPE,
                paint: { "circle-radius": [null, CIRCLE_RADIUS] },
            });
        };
    }, [selectedSpot]);

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
