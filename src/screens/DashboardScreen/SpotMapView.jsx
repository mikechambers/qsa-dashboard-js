import { useEffect, useRef } from "react";
import { Map, Marker, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";


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

    useEffect(() => {
        const map = mapInstance.current;
        const loc = selectedSpot?.location;
        if (!map || !loc) return;

        const marker = new Marker()
            .setLngLat([loc.longitude, loc.latitude])
            .addTo(map);

        return () => marker.remove();
    }, [selectedSpot?.location]);

    return (
        <div
            ref={mapContainer}
            style={{ width: "100%", height: "100%", borderRadius: "6px" }}
        />
    );
};
