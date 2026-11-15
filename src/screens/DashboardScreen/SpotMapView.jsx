import { useEffect, useRef } from "react";
import { Map, Marker, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";

import { getCSSColorForSNR } from "@/utils/view";

setWorkerUrl(workerUrl);

export const SpotMapView = ({
    spots,
    selectedSpot,
    onSpotHighlight,
    location,
}) => {
    const mapContainer = useRef(null);
    const mapInstance = useRef(null);

    //todo: look into using GeoJSON to display
    const addMarkerToMap = (el, loc) => {
        const map = mapInstance.current;

        if (!map || !loc) return;

        const marker = new Marker({ element: el })
            .setLngLat([loc.longitude, loc.latitude])
            .addTo(map);

        return marker;
    };

    useEffect(() => {
        if (mapInstance.current) return;

        mapInstance.current = new Map({
            container: mapContainer.current,
            style: "https://styles.maptoolkit.org/light.json",
            center: [-122.38, 37.58],
            zoom: 3,
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

        const color = "#1c7ed6";

        const el = document.createElement("div");
        el.style.width = "20px";
        el.style.height = "20px";
        el.style.borderRadius = "50%";
        el.style.background = color;
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

            const el = document.createElement("div"); // MapLibre positions this one

            const dot = document.createElement("div"); // you style and scale this one
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

        return () => {
            markers.forEach((marker) => {
                marker.remove();
            });
        };
    }, [spots, selectedSpot]);

    return (
        <div
            ref={mapContainer}
            style={{ width: "100%", height: "100%", borderRadius: "6px" }}
        />
    );
};
