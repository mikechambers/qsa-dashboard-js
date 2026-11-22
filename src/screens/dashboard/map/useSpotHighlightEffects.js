import { useEffect } from "react";
import greatCircle from "@turf/great-circle";
import {
    CONNECTION_LINE_PATH,
    CONNECTION_POINT,
    EMPTY_FEATURE_COLLECTION,
} from "./config";

export const isMapAlive = (map) => !!map && !!map.style;

//hook that handles / controls spot highlights / animations
export function useSpotHighlightEffects(map, ready, selectedSpot, location) {
    //draws line from home to the selected spot
    useEffect(() => {
        if (!map || !ready || !selectedSpot || !location) return;

        const to = selectedSpot.receiverLocation;
        if (!to) return;

        //draw the line
        map.getSource(CONNECTION_LINE_PATH)?.setData(
            greatCircle(location.coordinates, to.coordinates, {
                npoints: 64,
            }),
        );

        //draw a small circle on the selectedSpot
        map.getSource(CONNECTION_POINT)?.setData({
            type: "Feature",
            geometry: { type: "Point", coordinates: to.coordinates },
            properties: {},
        });

        //clear everything when unselected
        return () => {
            if (!isMapAlive(map)) return;

            map.getSource(CONNECTION_LINE_PATH)?.setData(
                EMPTY_FEATURE_COLLECTION,
            );
            map.getSource(CONNECTION_POINT)?.setData(EMPTY_FEATURE_COLLECTION);
        };
    }, [map, ready, selectedSpot?.id, location?.id]);
}
