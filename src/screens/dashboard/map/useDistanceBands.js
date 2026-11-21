import { useEffect } from "react";
import circle from "@turf/circle";
import { DisplayMode } from "@/enums/DisplayMode";
import { UnitType } from "@/enums/UnitType";
import { milesToKilometers } from "@/utils/geo";
import { convertAndFormatDistance, formatNumber } from "@/utils/view";
import {
    DISTANCE_LABEL_PATH,
    DISTANCE_LABEL_SIZE,
    DISTANCE_RANGE_PATH,
    FURTHEST_RANGE_PATH,
    EMPTY_FEATURE_COLLECTION,
} from "./config";
import { MAP_DISTANCE_RING_PALETTE } from "@/consts/config";

//ring distances to draw depending on user unit setting
const RING_DISTANCES = {
    [UnitType.IMPERIAL]: [750, 2500, 6500], // miles
    [UnitType.METRIC]: [1000, 4000, 10000], // km
};

// Make longitudes continuous across the antimeridian (179 -> 181, not 179 -> -179)
const unwrapLongitudes = (coords) => {
    let offset = 0;
    return coords.map(([lng, lat], i) => {
        if (i > 0) {
            const jump = lng - coords[i - 1][0];
            if (jump > 180) offset -= 360;
            else if (jump < -180) offset += 360;
        }
        return [lng + offset, lat];
    });
};

const wrapLongitude = (lng) => ((((lng + 180) % 360) + 360) % 360) - 180;

// Cut a line (with continuous, unwrapped longitudes) at the antimeridian so
// every piece stays inside -180..180. Works on flat maps and on the globe.
const splitAtAntimeridian = (coords) => {
    const lines = [];
    let line = [];
    const flush = () => {
        if (line.length > 1) lines.push(line);
        line = [];
    };

    coords.forEach(([lng, lat], i) => {
        if (i > 0) {
            const [prevLng, prevLat] = coords[i - 1];

            //which 360 degree wide band each point sits in (edges at 180 + 360k)
            const a = Math.floor((prevLng + 180) / 360);
            const b = Math.floor((lng + 180) / 360);
            if (a !== b) {
                const edge = Math.max(a, b) * 360 - 180;
                const t = (edge - prevLng) / (lng - prevLng);
                const crossLat = prevLat + t * (lat - prevLat);
                const eastward = lng > prevLng;
                line.push([eastward ? 180 : -180, crossLat]);
                flush();
                line.push([eastward ? -180 : 180, crossLat]);
            }
        }
        line.push([wrapLongitude(lng), lat]);
    });
    flush();
    return lines;
};

const EARTH_RADIUS_KM = 6371.0088;

// Point km due east of center along a great circle.
//used to position labels
const pointEast = ([lng, lat], km) => {
    const d = km / EARTH_RADIUS_KM; // angular distance, radians
    const lat1 = (lat * Math.PI) / 180;
    const lng1 = (lng * Math.PI) / 180;

    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d));
    const lng2 =
        lng1 +
        Math.atan2(
            Math.sin(d) * Math.cos(lat1),
            Math.cos(d) - Math.sin(lat1) * Math.sin(lat2),
        );
    return [wrapLongitude((lng2 * 180) / Math.PI), (lat2 * 180) / Math.PI];
};

// Label for a distance ring, as a GeoJSON point.
const labelFeature = (center, km, label, kind) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: pointEast(center, km) },
    properties: { label, kind },
});

const labelPaint = (theme) => ({
    "text-color": theme.label,
});

// One ring as a GeoJSON feature
const ringFeature = (center, distance, units, properties = {}) => {
    const ring = circle(center, distance, { units, steps: 128 });
    return {
        type: "Feature",
        geometry: {
            type: "MultiLineString",
            coordinates: splitAtAntimeridian(
                unwrapLongitudes(ring.geometry.coordinates[0]),
            ),
        },
        properties,
    };
};

const paletteFor = (displayMode) => {
    return MAP_DISTANCE_RING_PALETTE[displayMode];
};

export const useDistanceBands = (
    map,
    ready,
    location,
    furthestKm,
    displayMode,
    unitType,
    showRings,
    showMax,
) => {
    const distances = RING_DISTANCES[unitType] ?? RING_DISTANCES.IMPERIAL;
    const units = UnitType.getDistanceUnit(unitType, false) ?? "miles";

    //set up the layers once the map is ready.
    useEffect(() => {
        if (!map || !ready) return;

        const theme = paletteFor(displayMode);

        map.addSource(DISTANCE_RANGE_PATH, {
            type: "geojson",
            data: EMPTY_FEATURE_COLLECTION,
        });

        map.addLayer({
            id: DISTANCE_RANGE_PATH,
            source: DISTANCE_RANGE_PATH,
            type: "line",
            paint: {
                "line-color": theme.ring,
                "line-opacity": theme.ringOpacity,
                "line-width": 1.5,
                "line-dasharray": [2, 2],
            },
        });

        //ring that always matches the furthest spot
        map.addSource(FURTHEST_RANGE_PATH, {
            type: "geojson",
            data: EMPTY_FEATURE_COLLECTION,
        });

        map.addLayer({
            id: FURTHEST_RANGE_PATH,
            source: FURTHEST_RANGE_PATH,
            type: "line",
            paint: {
                "line-color": theme.furthest,
                "line-opacity": theme.furthestOpacity,
                "line-width": 3,
            },
        });

        //distance labels for rings
        map.addSource(DISTANCE_LABEL_PATH, {
            type: "geojson",
            data: EMPTY_FEATURE_COLLECTION,
        });

        map.addLayer({
            id: DISTANCE_LABEL_PATH,
            source: DISTANCE_LABEL_PATH,
            type: "symbol",
            layout: {
                "text-field": ["get", "label"],
                "text-font": ["Noto Sans Bold"],
                "text-size": DISTANCE_LABEL_SIZE,
                "text-allow-overlap": true,
                //furthest label wins if two sit close together
                "symbol-sort-key": ["match", ["get", "kind"], "furthest", 0, 1],
            },
            paint: {
                ...labelPaint(theme),
            },
        });

        return () => {
            [
                DISTANCE_LABEL_PATH,
                FURTHEST_RANGE_PATH,
                DISTANCE_RANGE_PATH,
            ].forEach((id) => {
                if (map.getLayer(id)) map.removeLayer(id);
                if (map.getSource(id)) map.removeSource(id);
            });
        };
    }, [map, ready]);

    // Rebuild the rings whenever the location or unit setting changes
    useEffect(() => {
        if (!map || !ready) return;

        const source = map.getSource(DISTANCE_RANGE_PATH);
        if (!source) return;

        if (!location || !showRings) {
            source.setData(EMPTY_FEATURE_COLLECTION);
            return;
        }

        const features = distances.map((distance) =>
            ringFeature(location.coordinates, distance, units, { distance }),
        );

        source.setData({ type: "FeatureCollection", features });
    }, [map, ready, location?.id, unitType, showRings]);

    // Furthest-spot ring: redraw whenever the furthest distance changes
    useEffect(() => {
        if (!map || !ready) return;

        const source = map.getSource(FURTHEST_RANGE_PATH);
        if (!source) return;

        if (!location || !furthestKm || !showMax) {
            source.setData(EMPTY_FEATURE_COLLECTION);
            return;
        }

        source.setData({
            type: "FeatureCollection",
            features: [
                ringFeature(location.coordinates, furthestKm, "kilometers"),
            ],
        });
    }, [map, ready, location?.id, furthestKm, showMax]);

    // Labels: one per fixed ring, plus one for the furthest ring
    useEffect(() => {
        if (!map || !ready) return;

        const source = map.getSource(DISTANCE_LABEL_PATH);
        if (!source) return;

        if (!location) {
            source.setData(EMPTY_FEATURE_COLLECTION);
            return;
        }

        const unitLabel = UnitType.getDistanceUnit(unitType) ?? "mi";
        const toKm =
            unitType === UnitType.METRIC ? (d) => d : milesToKilometers;

        const features = showRings
            ? distances.map((distance) =>
                  labelFeature(
                      location.coordinates,
                      toKm(distance),
                      `${formatNumber(distance)} ${unitLabel}`,
                      "ring",
                  ),
              )
            : [];

        if (furthestKm && showMax) {
            const { d, unit } = convertAndFormatDistance(furthestKm, unitType);
            features.push(
                labelFeature(
                    location.coordinates,
                    furthestKm,
                    `${d} ${unit}`,
                    "furthest",
                ),
            );
        }

        source.setData({ type: "FeatureCollection", features });
    }, [map, ready, location?.id, unitType, furthestKm, showRings, showMax]);
};
