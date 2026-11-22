import { useEffect, useState } from "react";
import { Map } from "maplibre-gl";

//initialize map instance, and set ready property once it has loaded.
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
