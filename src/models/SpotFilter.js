import { ALL_CASES } from "../consts";

export class SpotFilter {
    callsign = "";
    band = ALL_CASES;
    mode = ALL_CASES;
    snr = -24;
    distance = 0;

    with(changes) {
        return Object.assign(new SpotFilter(), this, changes);
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
