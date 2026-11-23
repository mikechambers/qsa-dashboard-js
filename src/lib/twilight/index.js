/* MIT License
 *
 * Copyright (c) 2026 Mike Chambers
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * twilight.js
 *
 * Builds "grey line" (day/night terminator) and twilight lines as GeoJSON,
 * ready to drop into a MapLibre geojson source.
 *
 */

const RAD = Math.PI / 180; // degrees -> radians
const DEG = 180 / Math.PI; // radians -> degrees
const MS_PER_DAY = 86400000;

// J2000.0 epoch: 2000-01-01 12:00 UTC. Sun formulas below count days from here.
const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);

/**
 * Sun elevation angles (degrees) for the lines we can draw.
 * Negative means below the horizon.
 */

const Elevations = Object.freeze({
    HORIZON: "HORIZON", // sunrise/sunset line (the grey line)
    CIVIL: "CIVIL",
    NAUTICAL: "NAUTICAL",
    ASTRONOMICAL: "ASTRONOMICAL",
});

const elevationValues = {
    HORIZON: -0.83, // sunrise/sunset line (the grey line)
    CIVIL: -6,
    NAUTICAL: -12,
    ASTRONOMICAL: -18,
};

export const ElevationValue = Object.freeze({
    ...Elevations,

    getValue: (name) => elevationValues[name],
});

/** Wrap any angle into the range -180..180. */
function normalize180(deg) {
    return ((((deg + 180) % 360) + 360) % 360) - 180;
}

/**
 * Where on Earth is the sun directly overhead right now?
 *
 * Uses the standard low-precision solar position formulas (good to roughly
 * 0.01 degrees, far more than a map overlay needs).
 *
 * @param {Date} date
 * @returns {{lat: number, lon: number}} degrees
 */
export function getSubsolarPoint(date = new Date()) {
    // Days since J2000.0 (can be fractional).
    const n = (date.getTime() - J2000_MS) / MS_PER_DAY;

    // Sun's mean longitude and mean anomaly (degrees).
    // These describe where the sun "would be" if Earth's orbit were a circle.
    const meanLongitude = 280.46 + 0.9856474 * n;
    const meanAnomaly = (357.528 + 0.9856003 * n) * RAD;

    // Ecliptic longitude: correct the mean longitude for the orbit's
    // ellipse (the two sine terms), in radians.
    const eclipticLon =
        (meanLongitude +
            1.915 * Math.sin(meanAnomaly) +
            0.02 * Math.sin(2 * meanAnomaly)) *
        RAD;

    // Earth's axial tilt (obliquity), radians. Changes very slowly.
    const tilt = (23.439 - 0.0000004 * n) * RAD;

    // Declination: how far north or south of the equator the sun is.
    // This IS the latitude of the subsolar point.
    const declination = Math.asin(Math.sin(tilt) * Math.sin(eclipticLon));

    // Right ascension: the sun's "longitude" on the celestial sphere,
    // in degrees.
    const rightAscension =
        Math.atan2(
            Math.cos(tilt) * Math.sin(eclipticLon),
            Math.cos(eclipticLon),
        ) * DEG;

    // Greenwich mean sidereal time (degrees): how far Earth has rotated
    // relative to the stars.
    const gmst = 280.46061837 + 360.98564736629 * n;

    // The sun is overhead at the longitude where Earth's rotation has
    // carried Greenwich away from the sun's right ascension.
    const lon = normalize180(rightAscension - gmst);

    return { lat: declination * DEG, lon };
}

/**
 * How high is the sun above the horizon at a given spot? (degrees)
 * 90 = straight up, 0 = on the horizon, negative = below.
 */
export function getSunElevation(lat, lon, date = new Date()) {
    const sun = getSubsolarPoint(date);

    const cosDistance =
        Math.sin(lat * RAD) * Math.sin(sun.lat * RAD) +
        Math.cos(lat * RAD) *
            Math.cos(sun.lat * RAD) *
            Math.cos((lon - sun.lon) * RAD);

    // Clamp to guard against tiny floating point overshoot before acos.
    const distanceDeg = Math.acos(Math.max(-1, Math.min(1, cosDistance))) * DEG;

    return 90 - distanceDeg;
}

/**
 * Points on a circle around `center`, every point `distanceDeg` degrees
 * of arc away from it. Returned as [lon, lat] pairs (GeoJSON order).
 *
 * Longitudes are "unwrapped": each point stays within 180 degrees of the
 * previous one, so the line never jumps across the date line. A ring that
 * wraps all the way around a pole will therefore run 360 degrees wide
 * (for example -150 .. 210). MapLibre draws that correctly as long as
 * renderWorldCopies is on (the default).
 *
 * @param {{lat: number, lon: number}} center
 * @param {number} distanceDeg  angular radius, 0..180
 * @param {number} stepDeg      angle between points; smaller = smoother
 * @returns {Array<[number, number]>}
 */
export function getRing(center, distanceDeg, stepDeg = 2) {
    const lat0 = center.lat * RAD;
    const d = distanceDeg * RAD;

    const coords = [];
    let prevLon = null;

    // "Bearing" here is the compass direction we step out from the center.
    for (let bearingDeg = 0; bearingDeg <= 360; bearingDeg += stepDeg) {
        const b = bearingDeg * RAD;

        // Standard "destination point" formula on a sphere: start at the
        // center, travel distance d along bearing b.
        const lat = Math.asin(
            Math.sin(lat0) * Math.cos(d) +
                Math.cos(lat0) * Math.sin(d) * Math.cos(b),
        );

        let lon =
            center.lon +
            Math.atan2(
                Math.sin(b) * Math.sin(d) * Math.cos(lat0),
                Math.cos(d) - Math.sin(lat0) * Math.sin(lat),
            ) *
                DEG;

        // Unwrap: keep this point within 180 degrees of the previous one.
        if (prevLon !== null) {
            while (lon - prevLon > 180) lon -= 360;
            while (lon - prevLon < -180) lon += 360;
        }
        prevLon = lon;

        coords.push([lon, lat * DEG]);
    }

    return coords;
}

const getElevationValues = (elevations) => {
    const values = elevations
        .map((e) => ElevationValue.getValue(e))
        .sort((a, b) => b - a);

    return values;
};

/**
 * The main entry point: one LineString feature per requested sun elevation.
 *
 * Each feature has properties { elevation } so a MapLibre layer can style
 * them with a data-driven expression, e.g.
 *   ["match", ["get", "elevation"], 0, "#fff", -6, "#aaa", ...]
 *
 * @param {Date} date
 * @param {number[]} elevations  sun elevations to draw (see TWILIGHT)
 * @returns {object} GeoJSON FeatureCollection
 */
export function getTwilightGeoJSON(date = new Date(), elevations) {
    const sun = getSubsolarPoint(date);

    const values = getElevationValues(elevations);

    return {
        type: "FeatureCollection",
        features: values.map((elevation) => ({
            type: "Feature",
            geometry: {
                type: "LineString",
                // Sun at elevation h sits (90 - h) degrees from the subsolar point.
                coordinates: getRing(sun, 90 - elevation),
            },
            properties: { elevation: elevation },
        })),
    };
}

// Latitude used to close a polygon at the pole. Web Mercator can't
// show exactly 90, so stay just short of it.
const POLE_LAT = 89.9;

/**
 * A filled spherical cap: every point within `radiusDeg` of `center`,
 * as the "coordinates" array of a GeoJSON Polygon (a list of rings).
 *
 * Three cases:
 *  - The cap contains a pole. Its edge runs all the way around the globe,
 *    so we close the shape by going up to that pole (the one in the
 *    center's hemisphere).
 *  - No pole, radius 90 or less. The edge is a closed loop and the cap is
 *    simply the inside of it.
 *  - No pole, radius over 90. The edge is again a closed loop, but now the
 *    cap is everything OUTSIDE it (the loop surrounds the opposite side of
 *    the globe). Draw a full-world box with the loop cut out as a hole.
 *    The box is centered on the loop and exactly 360 degrees wide, so it
 *    covers the world once.
 */
function capPolygon(center, radiusDeg) {
    const ring = getRing(center, radiusDeg);
    const first = ring[0];
    const last = ring[ring.length - 1];

    if (Math.abs(last[0] - first[0]) > 180) {
        const poleLat = center.lat >= 0 ? POLE_LAT : -POLE_LAT;
        return [[...ring, [last[0], poleLat], [first[0], poleLat], first]];
    }

    if (radiusDeg <= 90) {
        return [ring];
    }

    const lons = ring.map((point) => point[0]);
    const mid = (Math.min(...lons) + Math.max(...lons)) / 2;
    const box = [
        [mid - 180, -POLE_LAT],
        [mid + 180, -POLE_LAT],
        [mid + 180, POLE_LAT],
        [mid - 180, POLE_LAT],
        [mid - 180, -POLE_LAT],
    ];
    return [box, ring];
}

/** Wrap a cap as a GeoJSON Feature tagged with its sun elevation. */
function capFeature(center, radiusDeg, elevation) {
    return {
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: capPolygon(center, radiusDeg),
        },
        properties: { elevation },
    };
}

/**
 * Night as filled polygons: one per elevation, each a cap centered on the
 * point directly opposite the sun (the "antisolar point").
 *
 * A spot where the sun is below elevation h is within (90 + h) degrees of
 * the antisolar point:  h = 0 -> 90,  -6 -> 84,  -12 -> 78,  -18 -> 72.
 *
 * The caps are nested. Draw them with a low fill opacity and they stack,
 * so the shading gets stronger toward the middle of the night.
 */
export function getNightGeoJSON(date = new Date(), elevations) {
    const values = getElevationValues(elevations);

    const sun = getSubsolarPoint(date);
    const antisolar = { lat: -sun.lat, lon: normalize180(sun.lon + 180) };

    return {
        type: "FeatureCollection",
        features: values.map((elevation) =>
            capFeature(antisolar, 90 + elevation, elevation),
        ),
    };
}

/**
 * Daylight as filled polygons: one per elevation, each a cap centered on
 * the subsolar point.
 */
export function getDayGeoJSON(date = new Date(), elevations) {
    const sun = getSubsolarPoint(date);

    const values = getElevationValues(elevations);

    return {
        type: "FeatureCollection",
        features: values.map((elevation) =>
            capFeature(sun, 90 - elevation, elevation),
        ),
    };
}
