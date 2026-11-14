import { useEffect, useRef } from "react";
import { Map, Marker, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";

import { getCSSColorForSNR } from "@/utils/view";

setWorkerUrl(workerUrl);

export const SpotMapView = ({ spots, selectedSpot, onSpotHighlight }) => {
    const mapContainer = useRef(null);
    const mapInstance = useRef(null);

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

    //todo: look into using GeoJSON to display
    const addMarkerToMap = (spot) => {
        const map = mapInstance.current;
        const loc = spot?.location;
        if (!map || !loc) return;

        const el = document.createElement("div");
        el.style.width = "14px";
        el.style.height = "14px";
        el.style.borderRadius = "50%";
        el.style.background = getCSSColorForSNR(spot.snr);
        el.style.border = "2px solid white";
        el.style.boxShadow = "0 0 4px rgba(0,0,0,0.4)";

        const marker = new Marker({ element: el })
            .setLngLat([loc.longitude, loc.latitude])
            .addTo(map);

        return marker;
    };
    /*
    useEffect(() => {
        const marker = addMarkerToMap(selectedSpot);

        return () => marker.remove();
    }, [selectedSpot?.location]);
*/
    console.log("spots", spots?.length);
    useEffect(() => {
        let markers = [];

        for (const s of spots) {
            const m = addMarkerToMap(s);

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
