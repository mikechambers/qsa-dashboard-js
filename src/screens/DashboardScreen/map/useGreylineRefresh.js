import { useEffect } from "react";
import { updateGreyline, TWILIGHT_REFRESH_MS } from "./greylineLayers";

export function useGreylineRefresh(map, ready, settings) {
    useEffect(() => {
        if (!map || !ready || !settings.showGreyline) return;

        const timer = setInterval(
            () => updateGreyline(map, settings),
            TWILIGHT_REFRESH_MS,
        );
        return () => clearInterval(timer);
    }, [map, ready, settings.showGreyline, settings.elevationValues]);
}
