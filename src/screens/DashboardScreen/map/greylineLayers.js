import { DisplayMode } from "../../../enums/DisplayMode";
import {
    getTwilightGeoJSON,
    getNightGeoJSON,
    getDayGeoJSON,
} from "@/utils/twilight";
import { EMPTY_FEATURE_COLLECTION } from "./config";

export const TWILIGHT_REFRESH_MS = 60_000;

const TWILIGHT_LINES = "TWILIGHT_LINES";
const NIGHT_PATH = "NIGHT_PATH";
const DAY_PATH = "DAY_PATH";

const TWILIGHT_PALETTE = {
    dark: {
        fill: "#1b2f7a",
        fillOpacity: 0, // night shading off in dark mode
        dayFill: "#ffffff",
        dayFillOpacity: 0.08,
        line: "#55555555",
        lineWidth: 1.0,
        lineOpacity: [
            "match",
            ["get", "elevation"],
            0,
            1,
            -6,
            0.9,
            -12,
            0.8,
            0.6,
        ],
    },
    light: {
        fill: "#000000",
        fillOpacity: 0.1,
        dayFill: "#ffffff",
        dayFillOpacity: 0, //day off in light mode
        line: "#AAAAAA55",
        lineWidth: 1,
        lineOpacity: [
            "match",
            ["get", "elevation"],
            0,
            0.9,
            -6,
            0.7,
            -12,
            0.6,
            0.45,
        ],
    },
};

export function addGreylineLayers(map, settings) {
    const p =
        settings.displayMode === DisplayMode.DARK
            ? TWILIGHT_PALETTE.dark
            : TWILIGHT_PALETTE.light;

    const now = new Date();

    /******** GREYLINE DAY LAYER ***********/
    map.addSource(DAY_PATH, {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION,
    });

    map.addLayer(
        {
            id: DAY_PATH,
            type: "fill",
            source: DAY_PATH,
            paint: {
                "fill-color": p.dayFill,
                "fill-opacity": p.dayFillOpacity,
                "fill-antialias": false,
            },
        },
        // beforeId,
    );

    /******** GREYLINE NIGHT LAYER ***********/
    map.addSource(NIGHT_PATH, {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION,
    });
    map.addLayer(
        {
            id: NIGHT_PATH,
            type: "fill",
            source: NIGHT_PATH,
            paint: {
                "fill-color": p.fill,
                "fill-opacity": p.fillOpacity,
                "fill-antialias": false,
            },
        },
        //beforeId,
    );

    /******** GREYLINE LINES LAYER ***********/
    map.addSource(TWILIGHT_LINES, {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION,
    });
    map.addLayer({
        id: TWILIGHT_LINES,
        type: "line",
        source: TWILIGHT_LINES,
        paint: {
            "line-color": p.line,
            "line-width": [
                "match",
                ["get", "elevation"],
                0,
                p.lineWidth + 1,
                p.lineWidth,
            ],
            "line-opacity": p.lineOpacity,
        },
    });
}

export function clearGreyline(map) {
    map.getSource(TWILIGHT_LINES)?.setData(EMPTY_FEATURE_COLLECTION);
    map.getSource(NIGHT_PATH)?.setData(EMPTY_FEATURE_COLLECTION);
    map.getSource(DAY_PATH)?.setData(EMPTY_FEATURE_COLLECTION);
}

export function updateGreyline(map, settings) {
    const now = new Date();

    map.getSource(TWILIGHT_LINES)?.setData(
        getTwilightGeoJSON(now, settings.elevationValues),
    );
    map.getSource(NIGHT_PATH)?.setData(
        getNightGeoJSON(now, settings.elevationValues),
    );
    map.getSource(DAY_PATH)?.setData(
        getDayGeoJSON(now, settings.elevationValues),
    );
}
