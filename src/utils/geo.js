import {Location} from "@/models/Location"
import {gridToLocation as libGridToLocation} from "@ham2k/lib-geo-tools"


export const gridToLocation = function(grid) {

    let [lat, long] = libGridToLocation(grid);

    return new Location({grid, latitude:lat, longitude:long})
}