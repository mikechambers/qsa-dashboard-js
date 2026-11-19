import { useEffect } from "react";
import {
    updateGreyline,
    TWILIGHT_REFRESH_MS,
    clearGreyline,
} from "./greylineLayers";

//hook for drawing / updating grayline overlays
export function useGreyline(map, ready, settings) {
    useEffect(() => {
        if (!map || !ready) return;

        if (!settings.showGreyline) {
            clearGreyline(map);
            return;
        }

        //draw greylines
        updateGreyline(map, settings);

        //redraw once a minute so it stays in correct position
        const timer = setInterval(
            () => updateGreyline(map, settings),
            TWILIGHT_REFRESH_MS,
        );
        return () => clearInterval(timer);
    }, [map, ready, settings.showGreyline, settings.elevationValues]);
}
