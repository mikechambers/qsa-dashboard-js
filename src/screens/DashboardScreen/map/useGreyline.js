import { useEffect } from "react";
import { updateGreyline, TWILIGHT_REFRESH_MS } from "./greylineLayers";

export function useGreyline(map, ready, settings) {
    useEffect(() => {
        if (!map || !ready) return;

        if (!settings.showGreyline) {
            clearGreyline(map);
            return;
        }

        updateGreyline(map, settings); // draw now, don't wait a minute
        const timer = setInterval(
            () => updateGreyline(map, settings),
            TWILIGHT_REFRESH_MS,
        );
        return () => clearInterval(timer);
    }, [map, ready, settings.showGreyline, settings.elevationValues]);
}
