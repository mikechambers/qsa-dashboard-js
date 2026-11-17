import { useEffect } from "react";
import greatCircle from "@turf/great-circle";
import {
    SPOT_PATH,
    CONNECTION_LINE_PATH,
    CONNECTION_POINT,
    CIRCLE_RADIUS,
    CIRCLE_RADIUS_SELECTED,
    TRANSITION_DURATION_IN,
    TRANSITION_DURATION_OUT,
    EASING_TYPE,
    EMPTY,
} from "./config";

export function useSelectedSpot(map, ready, selectedSpot, location) {
    //grow the selected spot, shrink it back when selection changes
    useEffect(() => {
        if (!map || !ready || !selectedSpot) return;

        const feature = {
            id: selectedSpot.id,
            source: SPOT_PATH,
            layer: { id: SPOT_PATH },
        };

        map.transition(feature, {
            duration: TRANSITION_DURATION_IN,
            delay: 0,
            ease: EASING_TYPE,
            paint: { "circle-radius": [null, CIRCLE_RADIUS_SELECTED] },
        });

        return () => {
            map.transition(feature, {
                duration: TRANSITION_DURATION_OUT,
                ease: EASING_TYPE,
                paint: { "circle-radius": [null, CIRCLE_RADIUS] },
            });
        };
    }, [map, ready, selectedSpot]);

    //line from home to the selected spot
    useEffect(() => {
        if (!map || !ready || !selectedSpot || !location) return;

        const to = selectedSpot.receiverLocation;
        if (!to) return;

        map.getSource(CONNECTION_LINE_PATH)?.setData(
            greatCircle(location.coordinates, to.coordinates, {
                npoints: 64,
            }),
        );

        map.getSource(CONNECTION_POINT)?.setData({
            type: "Feature",
            geometry: { type: "Point", coordinates: to.coordinates },
            properties: {},
        });
        return () => {
            map.getSource(CONNECTION_LINE_PATH)?.setData(EMPTY);
            map.getSource(CONNECTION_POINT)?.setData(EMPTY);
        };
    }, [map, ready, selectedSpot, location]);
}
