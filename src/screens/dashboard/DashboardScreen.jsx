/* MIT License
 *
 * Copyright (c) 2026 Mike Chambers
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
import { PodsTab } from "./pods/PodsTab";
import { SpotFilterView } from "./filters/SpotFilterView";
import { SpotFilterTab } from "./filters/SpotFilterTab";
import { SelectedSpotProvider } from "@/contexts/SelectedSpotContext";
import { Collapse } from "@mantine/core";
import { SpotsContainer } from "./spots/SpotsContainer";
import { SETTINGS_PATH } from "@/consts/config";

export default function DashboardScreen() {
    let params = useParams();
    let { settings, setShowSpots } = useSettings();

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

                <div
                    className={`${classes.dashboardScreenMain} ${
                        settings.showSpots ? "" : classes.spotsCollapsed
                    }`}
                >
                    <div className={classes.summary}>
                        <Collapse expanded={settings.showPods}>
                            <PodContainer />
                        </Collapse>
                        {!settings.showPods && <PodsTab />}
                    </div>

                    <div className={classes.filter}>
                        <Collapse expanded={settings.showFilters}>
                            <SpotFilterView />
                        </Collapse>
                        {!settings.showFilters && <SpotFilterTab />}
                    </div>

                    <div className={classes.spotMap}>
                        <SpotMap location={location} spots={filteredSpots} />
                    </div>

                    <SpotsContainer
                        open={settings.showSpots}
                        onOpenChange={setShowSpots}
                    />
                </div>
            </div>
        </SelectedSpotProvider>
    );
}
