import { useParams, useNavigate } from "react-router";
import { useState } from "react";

import { useSettings } from "@/context/SettingsContext";
import {isValidCallsign, normalizeCallsign} from "@/utils/radio"
import {ConnectionStatusView} from "./ConnectionStatusView";
import {useSpotData} from "@/context/SpotDataContext";
import "./DashboardScreen.css";
import { SpotsView } from "./SpotsView";

export default function DashboardScreen(props) {

    let params = useParams()
    let {settings} = useSettings()
    const navigate = useNavigate();
    const {spots, status} = useSpotData();

    const [selectedSpot, setSelectedSpot] = useState()

    const onSpotHighlight = (spot) => {
        setSelectedSpot(spot)
    }

    let callsign = params.callsign
    let grid = undefined

    if(!("callsign" in params)) {
        callsign = settings.callsign;
    }

    if(typeof callsign === "string" && isValidCallsign(callsign.trim())){
        callsign = normalizeCallsign(callsign)
    } else {
        navigate("/")
    }

    console.log(callsign)

    return(
        <div id="dashboardScreen" className="screen">
            <div id="dashboardScreenHeader">
                <h1>{callsign} : {grid}</h1>
            </div>
            <div id="dashboardScreenMain">
                <div id="summaryPods">
                    <div>Spots : {spots.length}</div>
                </div>
                <div id="spotMap">MAP</div>
                <div id="spotsContainer">
                
                    <SpotsView spots={spots} onSpotHighlight={onSpotHighlight} selectedSpot={selectedSpot}/>
              
                </div>
            </div>
            <div id="dashboardScreenFooter"><ConnectionStatusView /></div>

        </div>
    )
}