import { useParams, Navigate } from "react-router";

import classes from "./DashboardScreen.module.css";
import screenClasses from "../screens.module.css";

import { useSettings } from "@/contexts/SettingsContext";
import { isValidCallsign, normalizeCallsign } from "@/utils/radio";
import { useSpotData } from "@/contexts/SpotDataContext";

import { SpotMap } from "./map/SpotMap";

import { SpotTable } from "./SpotTable";
import { DashboardHeaderView } from "./DashboardHeaderView";
import { gridToLocation } from "@/utils/geo";
import { SummaryPodsContainerView } from "./summary/SummaryPodsContainerView";
import { SpotFilterView } from "./SpotFilterView";
import { SelectedSpotProvider } from "../../contexts/SelectedSpotContext";
import { SelectedSpotDetail } from "./SelectedSpotDetail";
import { Collapse } from "@mantine/core";

export default function DashboardScreen(props) {
    let params = useParams();
    let { settings } = useSettings();

    const { filteredSpots } = useSpotData();

    let callsign = params.callsign;
    let grid = params.grid;

    if (!("callsign" in params)) {
        callsign = settings.callsign;
        grid = settings.grid;
    }

    let location;
    if (grid) {
        location = gridToLocation(grid);
    }

    if (typeof callsign === "string" && isValidCallsign(callsign.trim())) {
        callsign = normalizeCallsign(callsign);
    } else {
        return <Navigate to="/" replace />;
    }

    return (
        <SelectedSpotProvider>
            <div
                className={`${classes.dashboardScreen} ${screenClasses.screen}`}
            >
                <DashboardHeaderView callsign={callsign} grid={grid} />

                <div className={classes.dashboardScreenMain}>
                    <SummaryPodsContainerView />

                    <Collapse
                        className={classes.filter}
                        expanded={settings.showFilters}
                    >
                        <SpotFilterView />
                    </Collapse>

                    <div className={classes.spotMap}>
                        <SpotMap location={location} spots={filteredSpots} />
                    </div>
                    <div className={classes.spotsContainer}>
                        <SelectedSpotDetail />
                        <SpotTable spots={filteredSpots} />
                    </div>
                </div>
            </div>
        </SelectedSpotProvider>
    );
}
