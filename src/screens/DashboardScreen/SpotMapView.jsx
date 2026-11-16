import { useEffect, useRef } from "react";
import { Map, Marker, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";

import greatCircle from "@turf/great-circle";

import { getCSSColorForSNR } from "@/utils/view";
import { IconCurrentLocation } from "@tabler/icons-react";
import { ActionIcon } from "@mantine/core";
import { useSettings } from "../../context/SettingsContext";
import { DisplayMode } from "../../enums/DisplayMode";

setWorkerUrl(workerUrl);

//empty featurecollection to use to clear layers
const EMPTY = { type: "FeatureCollection", features: [] };

const LOCATION_COLOR = "#1c7ed6";
const CONNECTION_LINE_PATH = "CONNECTION_LINE_PATH";
const SPOT_PATH = "SPOT_PATH";

export const SpotMapView = ({
    spots,
    selectedSpot,
    onSpotHighlight,
    location,
}) => {
    const { settings } = useSettings();

    const mapContainer = useRef(null);
    const mapInstance = useRef(null);

    const centerOnLocation = () => {
        if (!mapInstance.current || !location) {
            return;
        }

        //todo: pass in zoom option (maybe default)
        mapInstance.current.flyTo({
            center: location.coordinates,
        });
    };

    //todo: look into using GeoJSON to display
    const addMarkerToMap = (el, loc) => {
        const map = mapInstance.current;

        if (!map || !loc) return;

        const marker = new Marker({ element: el })
            .setLngLat([loc.longitude, loc.latitude])
            .addTo(map);

        return marker;
    };

    //todo: rename this
    const setPath = (spot) => {
        const src = mapInstance.current?.getSource(CONNECTION_LINE_PATH);
        if (!src || !location) {
            return;
        }

        const to = spot?.receiverLocation;

        src.setData(
            location && to
                ? greatCircle(
                      [location.longitude, location.latitude],
                      [to.longitude, to.latitude],
                      { npoints: 64 },
                  )
                : EMPTY,
        );
    };

    const getMapStyleUrl = () => {
        const displayMode =
            settings.displayMode === DisplayMode.DARK ? "dark" : "light";

        return `https://styles.maptoolkit.org/${displayMode}.json`;
    };

    useEffect(() => {
        const map = mapInstance.current;
        if (!map || !settings?.displayMode) {
            return;
        }
        const url = getMapStyleUrl();
        map.setStyle(url);

        map.once("style.load", () => {
            //todo: fix this (line 108-121)
            addSpotSourcesAndLayers(map);
        });
    }, [settings?.displayMode]);

    useEffect(() => {
        if (mapInstance.current) return;

        const url = getMapStyleUrl();
        console.log(url);
        mapInstance.current = new Map({
            container: mapContainer.current,
            style: url,
            center: [-122.38, 37.58],
            zoom: 3,
        });

        mapInstance.current.on("load", () => {
            const map = mapInstance.current;

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
                    "line-opacity": 0.7,
                    "line-dasharray": [2, 2],
                },
            });

            map.addSource(SPOT_PATH, { type: "geojson", data: EMPTY });

            map.addLayer({
                id: SPOT_PATH,
                source: SPOT_PATH,
                type: "circle",
                paint: {
                    "circle-radius": 7,
                    "circle-color": ["get", "color"],
                    "circle-stroke-width": 2,
                    "circle-stroke-color": "white",
                },
            });

            map.on("mouseenter", SPOT_PATH, (e) => {
                const f = e.features[0];

                let s = spots.find((spot) => spot.id === f.properties.spotId);

                //maybe we just set directly?
                onSpotHighlight(s);
            });

            map.on("mouseleave", SPOT_PATH, () => {
                console.log("leave");
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

        /* right now we draw markers with elements. It makes it
        easier to handler interactions and animations, but makes it where the markers always overlay maps layers (such as lines).
        Right now, we will keep it as it is, but at some point we need
        to refactor to use geojson and not elements
        */
        const el = document.createElement("div");
        el.style.width = "20px";
        el.style.height = "20px";
        el.style.borderRadius = "50%";
        el.style.background = LOCATION_COLOR;
        el.style.border = "3px solid white";
        el.style.boxShadow =
            "0 0 0 4px rgba(28,126,214,0.3), 0 0 6px rgba(0,0,0,0.4)";
        el.className = "home-marker";

        const m = addMarkerToMap(el, location);

        return () => {
            if (m) m.remove();
        };
    }, [location]);

    //todo: we could split these between selectedSpot and spots
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
        console.log("spots:", spots.length, "first feature:", features[0]);
        console.log("source exists:", !!map.getSource(SPOT_PATH));

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

        /*
        if (selectedSpot) {
            setPath(selectedSpot);
        }
            */

        return () => {
            /*
            markers.forEach((marker) => {
                marker.remove();
            });
            */
        };
    }, [spots, selectedSpot]);

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
        </div>
    );
};
