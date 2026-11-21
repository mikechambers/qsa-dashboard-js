//empty featurecollection to use to clear layers
export const EMPTY_FEATURE_COLLECTION = {
    type: "FeatureCollection",
    features: [],
};

export const LOCATION_COLOR = "#1c7ed6";
export const CONNECTION_LINE_PATH = "CONNECTION_LINE_PATH";
export const SPOT_PATH = "SPOT_PATH";
export const CONNECTION_POINT = "CONNECTION_POINT";
export const SELECTED_SPOT = "SELECTED_SPOT";
export const DISTANCE_RANGE_PATH = "DISTANCE_RANGE_PATH";
export const FURTHEST_RANGE_PATH = "FURTHEST_RANGE_PATH";
export const DISTANCE_LABEL_PATH = "DISTANCE_LABEL_PATH";
export const DISTANCE_LABEL_SIZE = 12;

//colors for the distance rings, per display mode.
// ring: fixed distance rings (neutral). furthest: ring that matches the
// furthest spot (green, teal-leaning so it isn't mistaken for a strong signal)
// label: text color for all the distance labels
export const DISTANCE_RING_PALETTE = {
    LIGHT: {
        ring: "#495057",
        ringOpacity: 0.5,
        furthest: "#0ca678",
        furthestOpacity: 0.9,
        label: "#495057",
    },
    DARK: {
        ring: "#adb5bd",
        ringOpacity: 0.5,
        furthest: "#20c997",
        furthestOpacity: 0.9,
        label: "#f1f3f5",
    },
};

export const CIRCLE_RADIUS = 6;
export const CIRCLE_RADIUS_SELECTED = 18;
export const CIRCLE_STROKE = 2;
export const TRANSITION_DURATION_IN = 600;
export const TRANSITION_DURATION_OUT = 300;
export const EASING_TYPE = "bounce";
export const DEFAULT_ZOOM = 3;
