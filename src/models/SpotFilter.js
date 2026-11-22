import { MIN_SNR } from "@/consts/config";
import { ALL_CASES } from "@/consts";

export const SpotFilterDefaults = {
    CALLSIGN: "",
    BAND: ALL_CASES,
    MODE: ALL_CASES,
    SNR: MIN_SNR,
    DISTANCE: 0,
    SKIP_DUPLICATES: false,
};

export class SpotFilter {
    callsign = SpotFilterDefaults.CALLSIGN;
    band = SpotFilterDefaults.BAND;
    mode = SpotFilterDefaults.MODE;
    snr = SpotFilterDefaults.SNR;
    distance = SpotFilterDefaults.DISTANCE;
    skipDuplicates = SpotFilterDefaults.SKIP_DUPLICATES;

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
            this.skipDuplicates != SpotFilterDefaults.SKIP_DUPLICATES
        );
    }

    filter(spots) {
        let hash = new Set();

        return spots.filter((spot) => {
            if (this.callsign) {
                const c = this.callsign.toUpperCase();
                if (!spot.receiverCall.toUpperCase().startsWith(c)) {
                    return false;
                }
            }

            if (!this.band || this.band !== ALL_CASES) {
                if (this.band !== spot.band) {
                    return false;
                }
            }

            if (!this.mode || this.mode !== ALL_CASES) {
                if (this.mode !== spot.mode) {
                    return false;
                }
            }

            if (spot.snr < this.snr) {
                return false;
            }

            if (spot.distance < this.distance) {
                return false;
            }

            if (this.skipDuplicates) {
                const key = `${spot.receiverCall}|${spot.band}`;
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
