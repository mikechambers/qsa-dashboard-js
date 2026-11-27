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

import { MIN_SNR } from "@/consts/config";
import { ALL_CASES } from "@/consts";

export const SpotFilterDefaults = {
    CALLSIGN: "",
    BAND: ALL_CASES,
    MODE: ALL_CASES,
    SNR: MIN_SNR,
    DISTANCE: 0,
    SKIP_DUPLICATES: false,
    AGE: ALL_CASES, //or the most minutes old
};

export class SpotFilter {
    callsign = SpotFilterDefaults.CALLSIGN;
    band = SpotFilterDefaults.BAND;
    mode = SpotFilterDefaults.MODE;
    snr = SpotFilterDefaults.SNR;
    distance = SpotFilterDefaults.DISTANCE;
    skipDuplicates = SpotFilterDefaults.SKIP_DUPLICATES;
    age = SpotFilterDefaults.AGE;

    with(changes) {
        return Object.assign(new SpotFilter(), this, changes);
    }

    hasFilter() {
        return (
            this.callsign != SpotFilterDefaults.CALLSIGN ||
            this.band != SpotFilterDefaults.BAND ||
            this.mode != SpotFilterDefaults.MODE ||
            this.snr != SpotFilterDefaults.SNR ||
            this.distance != SpotFilterDefaults.DISTANCE ||
            this.skipDuplicates != SpotFilterDefaults.SKIP_DUPLICATES ||
            this.age != SpotFilterDefaults.AGE
        );
    }

    //whether the other station of a spot or decode passes
    matches({ call, band, mode, snr, distance, date }, now = Date.now()) {
        if (this.callsign) {
            const c = this.callsign.toUpperCase();
            if (!call?.toUpperCase().startsWith(c)) {
                return false;
            }
        }

        if (!this.band || this.band !== ALL_CASES) {
            if (this.band !== band) {
                return false;
            }
        }

        if (!this.mode || this.mode !== ALL_CASES) {
            if (this.mode !== mode) {
                return false;
            }
        }

        if (snr < this.snr) {
            return false;
        }

        if (distance < this.distance) {
            return false;
        }

        if (this.age !== ALL_CASES && now - date > this.age * 60_000) {
            return false;
        }

        return true;
    }

    //stations is from getActiveStations
    filterStations(stations, now = Date.now()) {
        return stations.filter(({ decode }) =>
            this.matches({ ...decode, date: decode.receivedAt }, now),
        );
    }

    filter(spots, now = Date.now()) {
        let hash = new Set();

        return spots.filter((spot) => {
            const { receiverCall, band, mode, snr, distance, date } = spot;
            const station = {
                call: receiverCall,
                band,
                mode,
                snr,
                distance,
                date,
            };
            if (!this.matches(station, now)) return false;

            if (this.skipDuplicates) {
                const key = `${spot.receiverCall}|${spot.band}|${spot.mode}`;
                if (hash.has(key)) {
                    return false;
                } else {
                    hash.add(key);
                }
            }

            return true;
        });
    }
}
