import { useEffect, useRef } from "react";
import { getCSSColorForSNR } from "@/utils/view";
import { SPOT_PATH } from "./config";

//hook that manages drawing contact spots on the map
export function useSpotLayer(map, ready, spots, onSpotHighlight) {
    //so references in enclosures dont become stale
    const spotsRef = useRef(spots);
    const highlightRef = useRef(onSpotHighlight);

    //this is so we can always get a reference to the current spot / highlight
    useEffect(() => {
        spotsRef.current = spots;
        highlightRef.current = onSpotHighlight;
    }, [spots, onSpotHighlight]);

    //redraw when spots change (once map is ready)
    useEffect(() => {
        if (!map || !ready) return;

        //create the geojson for the spots
        const features = spots.map((s) => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: s.receiverLocation.coordinates,
            },
            properties: { color: getCSSColorForSNR(s.snr), spotId: s.id },
        }));

        //draw the actual spots
        map.getSource(SPOT_PATH)?.setData({
            type: "FeatureCollection",
            features,
        });
    }, [map, ready, spots]);

    //called once map is ready. We use to init events
    useEffect(() => {
        if (!map || !ready) return;

        //figure out if the user has moused over a spot. if so, make it selected.
        const onEnter = (e) => {
            const id = e.features[0]?.properties.spotId;
            const s = spotsRef.current.find((spot) => spot.id === id);
            if (s) highlightRef.current(s);
        };

        map.on("mouseenter", SPOT_PATH, onEnter);

        //listen for when users clicks on the map, not on a spot.
        //if they do, clear selectedSpot
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
