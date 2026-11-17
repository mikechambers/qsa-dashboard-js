import {
    EMPTY_FEATURE_COLLECTION,
    LOCATION_COLOR,
    SPOT_PATH,
    CONNECTION_LINE_PATH,
    CONNECTION_POINT,
    CIRCLE_RADIUS,
    CIRCLE_STROKE,
} from "./config";

export function addSpotLayer(map) {
    map.addSource(SPOT_PATH, {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION,
        promoteId: "spotId",
    });

    map.addLayer({
        id: SPOT_PATH,
        source: SPOT_PATH,
        type: "circle",
        paint: {
            "circle-radius": CIRCLE_RADIUS,
            "circle-color": ["get", "color"],
            "circle-stroke-width": CIRCLE_STROKE,
            "circle-stroke-color": "white",
        },
    });
}

export function addConnectionLineLayer(map) {
    map.addSource(CONNECTION_LINE_PATH, {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION,
    });

    //the layer we draw the line into. empty until a spot is selected.
    map.addLayer({
        id: CONNECTION_LINE_PATH,
        type: "line",
        layout: { "line-cap": "round" },
        source: CONNECTION_LINE_PATH,
        paint: {
            "line-color": LOCATION_COLOR,
            "line-width": 2,
            "line-opacity": 1.0,
            "line-dasharray": [2, 2],
        },
    });
}

export function addConnectionPointLayer(map) {
    map.addSource(CONNECTION_POINT, {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION,
    });

    map.addLayer({
        id: CONNECTION_POINT,
        source: CONNECTION_POINT,
        type: "circle",
        paint: {
            "circle-radius": 4,
            "circle-color": LOCATION_COLOR,
            "circle-stroke-width": 0,
        },
    });
}
