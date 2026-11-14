import { useParams, Navigate } from "react-router";
import { useState } from "react";

import { useSettings } from "@/context/SettingsContext";
import { isValidCallsign, normalizeCallsign } from "@/utils/radio";
import { ConnectionStatusView } from "./ConnectionStatusView";
import { useSpotData } from "@/context/SpotDataContext";
import "./DashboardScreen.css";
import { SpotMapView } from "./SpotMapView";
import { SpotDetail } from "./SpotDetail";
import { SpotTable } from "./SpotTable";
import { DashboardHeaderView } from "./DashboardHeaderView";

export default function DashboardScreen(props) {
    let params = useParams();
    let { settings } = useSettings();
    //const navigate = useNavigate();
    const { spots, status } = useSpotData();

    const [selectedSpot, setSelectedSpot] = useState();

    const onSpotHighlight = (spot) => {
        setSelectedSpot(spot);
    };

    let callsign = params.callsign;
    let grid = undefined;

    //todo: using wrong callsign in header
    if (!("callsign" in params)) {
        callsign = settings.callsign;
    }

    if (typeof callsign === "string" && isValidCallsign(callsign.trim())) {
        callsign = normalizeCallsign(callsign);
    } else {
        //return (<Navigate to="/" replace />);
        console.log("CALLSIGN", callsign);
    }

    console.log(callsign);

    return (
        <div id="dashboardScreen" className="screen">
            <DashboardHeaderView />
            <div id="dashboardScreenMain">
                <div id="summaryPods"></div>
                <div id="spotMap">
                    <SpotMapView
                        spots={spots}
                        onSpotHighlight={onSpotHighlight}
                        selectedSpot={selectedSpot}
                    />
                </div>
                <div id="spotsContainer">
                    <SpotDetail spot={selectedSpot} />
                    <SpotTable
                        spots={spots}
                        onSpotHighlight={onSpotHighlight}
                    />
                </div>
            </div>
        </div>
    );
}
