import { useEffect, useRef } from "react";
import greatCircle from "@turf/great-circle";
import { getCSSColorForSNR } from "@/utils/view";
import {
    CONNECTION_LINE_PATH,
    CONNECTION_POINT,
    SELECTED_SPOT,
    CIRCLE_RADIUS,
    CIRCLE_RADIUS_SELECTED,
    TRANSITION_DURATION_IN,
    TRANSITION_DURATION_OUT,
    EASING_TYPE,
    EMPTY_FEATURE_COLLECTION,
} from "./config";
import { ADD_SPOT_JITTER } from "@/consts/config";
import { getJitteredCoordinates } from "@/utils/geo";

export const isMapAlive = (map) => !!map && !!map.style;

//hook that handles / controls spot highlights / animations
export function useSpotHighlightEffects(map, ready, selectedSpot, location) {
    //features currently on the selected layer. a spot stays here while it
    //shrinks back out, so the old and new spots can animate together
    const featuresRef = useRef([]);

    //draw the selected spot on its own layer, on top of all other spots
    useEffect(() => {
        if (!map || !ready || !selectedSpot?.receiverLocation) return;

        const feature = {
            id: selectedSpot.id,
            source: SELECTED_SPOT,
            layer: { id: SELECTED_SPOT },
        };

        const syncSource = () => {
            if (!isMapAlive(map)) return;

            map.getSource(SELECTED_SPOT)?.setData({
                type: "FeatureCollection",
                features: featuresRef.current,
            });
        };

        const others = featuresRef.current.filter((f) => {
            return f.id !== selectedSpot.id;
        });

        //if we are using spot jitter we need to adjust for it
        const coordinates = ADD_SPOT_JITTER
            ? getJitteredCoordinates(
                  selectedSpot.receiverLocation,
                  selectedSpot.id,
              )
            : selectedSpot.receiverLocation.coordinates;

        const selectedFeature = {
            type: "Feature",
            id: selectedSpot.id,
            geometry: {
                type: "Point",
                coordinates: coordinates,
            },
            properties: { color: getCSSColorForSNR(selectedSpot.snr) },
        };

        featuresRef.current = [...others, selectedFeature];

        syncSource();

        //animate the radius up to the selected size
        map.transition(feature, {
            duration: TRANSITION_DURATION_IN,
            delay: 0,
            ease: EASING_TYPE,
            paint: { "circle-radius": [null, CIRCLE_RADIUS_SELECTED] },
        });

        //shrink back down when deselected, then remove it from the layer
        return () => {
            //the map is already gone if the dashboard is unmounting
            if (!isMapAlive(map)) return;

            map.transition(feature, {
                duration: TRANSITION_DURATION_OUT,
                ease: EASING_TYPE,
                paint: { "circle-radius": [null, CIRCLE_RADIUS] },
            });
            setTimeout(() => {
                featuresRef.current = featuresRef.current.filter(
                    (f) => f.id !== selectedSpot.id,
                );
                syncSource();
            }, TRANSITION_DURATION_OUT);
        };
    }, [map, ready, selectedSpot?.id]);

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
