import { useEffect, useRef } from "react";
import { getCSSColorForSNR } from "@/utils/view";
import { SPOT_PATH } from "./config";

export function useSpotLayer(map, ready, spots, onSpotHighlight) {
    //so references in enclosures dont become stale
    const spotsRef = useRef(spots);
    const highlightRef = useRef(onSpotHighlight);

    useEffect(() => {
        spotsRef.current = spots;
        highlightRef.current = onSpotHighlight;
    }, [spots, onSpotHighlight]);

    //redraw when spots change
    useEffect(() => {
        if (!map || !ready) return;

        const features = spots.map((s) => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: s.receiverLocation.coordinates,
            },
            properties: { color: getCSSColorForSNR(s.snr), spotId: s.id },
        }));

        map.getSource(SPOT_PATH)?.setData({
            type: "FeatureCollection",
            features,
        });
    }, [map, ready, spots]);

    useEffect(() => {
        if (!map || !ready) return;

        const onEnter = (e) => {
            const id = e.features[0]?.properties.spotId;
            const s = spotsRef.current.find((spot) => spot.id === id);
            if (s) highlightRef.current(s);
        };

        map.on("mouseenter", SPOT_PATH, onEnter);

        const onClick = (e) => {
            const hits = map.queryRenderedFeatures(e.point, {
                layers: [SPOT_PATH],
            });
            if (hits.length === 0) {
                onSpotHighlight(undefined);
            }
        };
        map.on("click", onClick);

        return () => {
            map.off("mouseenter", SPOT_PATH, onEnter);
            map.off("click", SPOT_PATH, onClick);
        };
    }, [map, ready]);
}
