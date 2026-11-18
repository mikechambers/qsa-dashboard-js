import { useParams, Navigate } from "react-router";
import { useState } from "react";

import { useSettings } from "@/context/SettingsContext";
import { isValidCallsign, normalizeCallsign } from "@/utils/radio";
import { useSpotData } from "@/context/SpotDataContext";
import "./DashboardScreen.css";
import { SpotMapView } from "./map/SpotMapView";
import { SpotDetail } from "./SpotDetail";
import { SpotTable } from "./SpotTable";
import { DashboardHeaderView } from "./DashboardHeaderView";
import { gridToLocation } from "@/utils/geo";
import { SummaryPodsContainerView } from "./summary/SummaryPodsContainerView";
import { SpotFilterView } from "./SpotFilterView";
import { SelectedSpotProvider } from "../../context/SelectedSpotContext";
import { SelectedSpotDetail } from "./SelectedSpotDetail";

export default function DashboardScreen(props) {
    let params = useParams();
    let { settings } = useSettings();

    const { spots, filteredSpots, status } = useSpotData();

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

                    <SpotFilterView />

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
