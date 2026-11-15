import { useEffect, useRef } from "react";
import { Map, Marker, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";

import greatCircle from "@turf/great-circle";

import { getCSSColorForSNR } from "@/utils/view";
import { IconCurrentLocation } from "@tabler/icons-react";

setWorkerUrl(workerUrl);

const EMPTY = { type: "FeatureCollection", features: [] };

const LOCATION_COLOR = "#1c7ed6";

export const SpotMapView = ({
    spots,
    selectedSpot,
    onSpotHighlight,
    location,
}) => {
    const mapContainer = useRef(null);
    const mapInstance = useRef(null);

    const centerOnLocation = () => {
        if (!mapInstance.current && location) {
            return;
        }

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

    const setPath = (spot) => {
        const src = mapInstance.current?.getSource("path");
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

    useEffect(() => {
        if (mapInstance.current) return;

        mapInstance.current = new Map({
            container: mapContainer.current,
            style: "https://styles.maptoolkit.org/light.json",
            center: [-122.38, 37.58],
            zoom: 3,
        });

        mapInstance.current.on("load", () => {
            const map = mapInstance.current;

            map.addSource("path", { type: "geojson", data: EMPTY });

            map.addLayer({
                id: "path",
                type: "line",
                layout: { "line-cap": "round" },
                source: "path",
                paint: {
                    "line-color": LOCATION_COLOR,
                    "line-width": 2,
                    "line-opacity": 0.7,
                    "line-dasharray": [2, 2],
                },
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

    useEffect(() => {
        let markers = [];

        for (const s of spots) {
            const color = getCSSColorForSNR(s.snr);

            //top level marker
            const el = document.createElement("div");

            //sub-element so we can transform without repositioning
            //map uses transform to position
            const dot = document.createElement("div");
            dot.style.width = "14px";
            dot.style.height = "14px";
            dot.style.borderRadius = "50%";
            dot.style.background = color;
            dot.style.border = "2px solid white";
            dot.style.boxShadow = "0 0 4px rgba(0,0,0,0.4)";
            dot.style.cursor = "pointer";

            dot.style.transition = "transform 0.15s ease-out";

            if (selectedSpot === s) {
                requestAnimationFrame(() => {
                    dot.style.transform = "scale(2.0)";
                });
            }

            el.appendChild(dot);

            //hover events
            el.addEventListener("mouseenter", () => {
                onSpotHighlight(s);
                dot.style.transform = "scale(2.0)";
            });
            el.addEventListener("mouseleave", () => {
                dot.style.transform = "";
            });

            const m = addMarkerToMap(el, s.receiverLocation);

            if (m) markers.push(m);
        }

        if (selectedSpot) {
            console.log("selected");
            setPath(selectedSpot);
        }

        return () => {
            markers.forEach((marker) => {
                marker.remove();
            });
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
