import { useEffect } from "react";
import { Marker } from "maplibre-gl";
import { LOCATION_COLOR } from "./config";

export function useHomeMarker(map, location) {
    useEffect(() => {
        if (!map || !location) return;

        //html element so the css class can animate / pulse it
        const el = document.createElement("div");
        el.style.width = "20px";
        el.style.height = "20px";
        el.style.borderRadius = "50%";
        el.style.background = LOCATION_COLOR;
        el.style.border = "3px solid white";
        el.style.boxShadow =
            "0 0 0 4px rgba(28,126,214,0.3), 0 0 6px rgba(0,0,0,0.4)";
        el.className = "home-marker";

        const marker = new Marker({ element: el })
            .setLngLat([location.longitude, location.latitude])
            .addTo(map);

        return () => marker.remove();
    }, [map, location]);
}
