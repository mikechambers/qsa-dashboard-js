import { useParams, Navigate } from "react-router";
import { useState } from "react";

import { useSettings } from "@/contexts/SettingsContext";
import { isValidCallsign, normalizeCallsign } from "@/utils/radio";
import { useSpotData } from "@/contexts/SpotDataContext";
import "./DashboardScreen.css";
import { SpotMapView } from "./map/SpotMapView";
import { SpotDetail } from "./SpotDetail";
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
            <div id="dashboardScreen" className="screen">
                <DashboardHeaderView callsign={callsign} grid={grid} />

                <div id="dashboardScreenMain">
                    <SummaryPodsContainerView />

                    <Collapse id="filter" expanded={settings.showFilters}>
                        <SpotFilterView />
                    </Collapse>

                    <div id="spotMap">
                        <SpotMapView
                            location={location}
                            spots={filteredSpots}
                        />
                    </div>
                    <div id="spotsContainer">
                        <SelectedSpotDetail />
                        <SpotTable spots={filteredSpots} />
                    </div>
                </div>
            </div>
        </SelectedSpotProvider>
    );
}
