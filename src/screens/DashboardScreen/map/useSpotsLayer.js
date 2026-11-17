import { useEffect } from "react";
import { getCSSColorForSNR } from "@/utils/view";
import { SPOT_PATH } from "./config";

export function useSpotLayer(map, ready, spots) {
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
}
