import { useEffect, useState } from "react";
import { Map } from "maplibre-gl";
import MaplibreTransition from "maplibre-transition";

export function useMapInstance(containerRef, { style, center, zoom }) {
    const [map, setMap] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const m = new Map({
            container: containerRef.current,
            style,
            center,
            zoom,
        });
        MaplibreTransition.init(m);
        m.on("load", () => setReady(true));
        setMap(m);

        return () => {
            m.remove();
            setMap(null);
            setReady(false);
        };
    }, []);

    return { map, ready };
}
