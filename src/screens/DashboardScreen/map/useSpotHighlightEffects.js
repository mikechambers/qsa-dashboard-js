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
    EMPTY_FEATURE_COLLECTION,
} from "./config";

//hook that handles / controls spot highlights / animations
export function useSpotHighlightEffects(map, ready, selectedSpot, location) {
    //selectedSpot changes
    useEffect(() => {
        if (!map || !ready || !selectedSpot) return;

        //find the spot that has already been drawns
        const feature = {
            id: selectedSpot.id,
            source: SPOT_PATH,
            layer: { id: SPOT_PATH },
        };

        //update it to animate its radius to a larger size
        map.transition(feature, {
            duration: TRANSITION_DURATION_IN,
            delay: 0,
            ease: EASING_TYPE,
            paint: { "circle-radius": [null, CIRCLE_RADIUS_SELECTED] },
        });

        //when there is a new spot selected, animate the spot to its previous size
        return () => {
            map.transition(feature, {
                duration: TRANSITION_DURATION_OUT,
                ease: EASING_TYPE,
                paint: { "circle-radius": [null, CIRCLE_RADIUS] },
            });
        };
    }, [map, ready, selectedSpot]);

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
            map.getSource(CONNECTION_LINE_PATH)?.setData(
                EMPTY_FEATURE_COLLECTION,
            );
            map.getSource(CONNECTION_POINT)?.setData(EMPTY_FEATURE_COLLECTION);
        };
    }, [map, ready, selectedSpot, location]);
}
