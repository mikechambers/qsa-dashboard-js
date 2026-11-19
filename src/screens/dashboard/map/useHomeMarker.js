import { useEffect } from "react";
import { Marker } from "maplibre-gl";
import { LOCATION_COLOR } from "./config";

import classes from "./useHomeMarker.module.css";

//hook for creating and setting home marker
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

        //defines animation (defined in SpotMap.css)
        el.className = classes.homeMarker;

        //add to map as HTML element. Will be on top of anything draw into
        //layers.
        const marker = new Marker({ element: el })
            .setLngLat([location.longitude, location.latitude])
            .addTo(map);

        return () => marker.remove();
    }, [map, location]);
}
