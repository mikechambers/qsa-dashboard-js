import Location from "@/models/Location"
import {gridToLocation as libGridToLocation} from "@ham2k/lib-geo-tools"
import { DXCC_BY_CODE } from '@ham2k/lib-dxcc-data';

export const gridToLocation = function(grid) {

    let [lat, long] = libGridToLocation(grid);

    return new Location({grid, latitude:lat, longitude:long})
}

export const getDXCCEntity = function(code) {
    return DXCC_BY_CODE[code];
}

export const metersToMiles = function(meters) {

    if(!meters) {
        return 0
    }

    return meters * 0.000621371;
}