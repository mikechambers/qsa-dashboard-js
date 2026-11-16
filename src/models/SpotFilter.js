import { ALL_CASES } from "../consts";

export class SpotFilter {
    callsign = "";
    band = ALL_CASES;
    mode = ALL_CASES;

    with(changes) {
        return Object.assign(new SpotFilter(), this, changes);
    }

    filter(spots) {
        return spots.filter((spot, index, array) => {
            if (this.callsign) {
                if (
                    !spot.receiverCall
                        .toUpperCase()
                        .startsWith(this.callsign.toUpperCase())
                ) {
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

            return true;
        });
    }
}
