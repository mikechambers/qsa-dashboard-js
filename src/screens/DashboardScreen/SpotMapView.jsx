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

            const el = document.createElement("div");
            el.style.width = "14px";
            el.style.height = "14px";
            el.style.borderRadius = "50%";
            el.style.background = color;
            el.style.border = "2px solid white";
            el.style.boxShadow = "0 0 4px rgba(0,0,0,0.4)";
            el.style.opacity = 0.5;

            const m = addMarkerToMap(el, s.receiverLocation);

            if (m) markers.push(m);
        }

        return () => {
            markers.forEach((marker) => {
                marker.remove();
            });
        };
    }, [spots]);

    return (
        <div
            ref={mapContainer}
            style={{ width: "100%", height: "100%", borderRadius: "6px" }}
        />
    );
};
