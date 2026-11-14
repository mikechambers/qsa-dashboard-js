import Location from "@/models/Location";
import { gridToLocation as libGridToLocation } from "@ham2k/lib-geo-tools";
import { DXCC_BY_CODE } from "@ham2k/lib-dxcc-data";

export const gridToLocation = function (grid) {
    //note : if greater than 6, we trim

    const g = grid.slice(0, 6);
    let [lat, long] = libGridToLocation(g);

    return new Location({ grid, latitude: lat, longitude: long });
};

export const getDXCCEntity = function (code) {
    return DXCC_BY_CODE[code];
};

export const kilometersToMiles = function (kilometers) {
    if (!kilometers) {
        return 0;
    }

    return kilometers * 0.621371;
};
