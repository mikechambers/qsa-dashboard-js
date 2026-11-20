import { useEffect } from "react";
import { useParams, Navigate } from "react-router";

import classes from "./DashboardScreen.module.css";
import screenClasses from "../screens.module.css";

import { useSettings } from "@/contexts/SettingsContext";
import {
    isValidCallsign,
    isValidMaidenHeadGrid,
    normalizeCallsign,
    normalizeMaidenHeadGrid,
} from "@/utils/radio";
import { useSpotData } from "@/contexts/SpotDataContext";
import { dashboardPath } from "@/utils/routes";

import { SpotMap } from "./map/SpotMap";

import { HeaderContainer } from "./header/HeaderContainer";
import { gridToLocation } from "@/utils/geo";
import { PodContainer } from "./pods/PodContainer";
import { SpotFilterView } from "./filters/SpotFilterView";
import { SelectedSpotProvider } from "@/contexts/SelectedSpotContext";
import { Collapse } from "@mantine/core";
import { SpotsContainer } from "./spots/SpotsContainer";
import { SETTINGS_PATH } from "@/consts/config";

export default function DashboardScreen() {
    let params = useParams();
    let { settings } = useSettings();

    const { filteredSpots, setActiveCallsign } = useSpotData();

    let callsign = params.callsign;
    let grid = params.grid;

    //no callsign in the url (/dashboard/): fall back to the saved settings,
    //and redirect below so the url shows the station being displayed
    const usingSettings = !params.callsign;

    if (usingSettings) {
        callsign = settings.callsign;
        grid = settings.grid;
    }

    let location;
    if (grid && isValidMaidenHeadGrid(grid)) {
        grid = normalizeMaidenHeadGrid(grid);
        location = gridToLocation(grid);
    } else {
        grid = "";
    }

    const callsignIsValid =
        typeof callsign === "string" && isValidCallsign(callsign.trim());

    if (callsignIsValid) {
        callsign = normalizeCallsign(callsign);
    }

    //tell the spot data which callsign to subscribe to. This must be above
    //the early return below, since hooks can't be called conditionally.
    useEffect(() => {
        if (callsignIsValid && !usingSettings) setActiveCallsign(callsign);
    }, [callsignIsValid, usingSettings, callsign, setActiveCallsign]);

    if (!callsignIsValid) {
        return <Navigate to={SETTINGS_PATH} replace />;
    }

    if (usingSettings) {
        return <Navigate to={dashboardPath(callsign, grid)} replace />;
    }

    return (
        <SelectedSpotProvider>
            <div
                className={`${classes.dashboardScreen} ${screenClasses.screen}`}
            >
                <HeaderContainer callsign={callsign} grid={grid} />

                <div className={classes.dashboardScreenMain}>
                    <PodContainer />

                    <Collapse
                        className={classes.filter}
                        expanded={settings.showFilters}
                    >
                        <SpotFilterView />
                    </Collapse>

                    <div className={classes.spotMap}>
                        <SpotMap location={location} spots={filteredSpots} />
                    </div>

                    <SpotsContainer spots={filteredSpots} />
                </div>
            </div>
        </SelectedSpotProvider>
    );
}
