import { MIN_SNR } from "@/consts/config";
import { ALL_CASES } from "../consts";

export const SpotFilterDefaults = {
    CALLSIGN: "",
    BAND: ALL_CASES,
    MODE: ALL_CASES,
    SNR: MIN_SNR,
    DISTANCE: 0,
};

export class SpotFilter {
    callsign = SpotFilterDefaults.CALLSIGN;
    band = SpotFilterDefaults.BAND;
    mode = SpotFilterDefaults.MODE;
    snr = SpotFilterDefaults.SNR;
    distance = SpotFilterDefaults.DISTANCE;

    with(changes) {
        return Object.assign(new SpotFilter(), this, changes);
    }

    hasFilter() {
        return (
            this.callsign != SpotFilterDefaults.CALLSIGN ||
            this.band != SpotFilterDefaults.BAND ||
            this.mode != SpotFilterDefaults.MODE ||
            this.snr != SpotFilterDefaults.SNR ||
            this.distance != SpotFilterDefaults.DISTANCE
        );
    }

    filter(spots) {
        return spots.filter((spot, index, array) => {
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

            return true;
        });
    }
}
