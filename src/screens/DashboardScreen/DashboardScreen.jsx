import { useParams } from "react-router";

import {CALLSIGN_STORAGE, GRID_STORAGE} from "@/config/"
import { useLocalStorage } from '@mantine/hooks';
import { useSettings } from "@/context/SettingsContext";
import {isValidCallsign, isValidMaidenHeadGrid, normalizeCallsign} from "@/utils/radio"
import { useNavigate } from 'react-router';
import {ConnectionStatusView} from "./ConnectionStatusView";
import {useSpotData} from "@/context/SpotDataContext";
import {SpotTable} from "./SpotTable"

import "./DashboardScreen.css";

export default function DashboardScreen(props) {

    let params = useParams()
    let {settings} = useSettings()
    const navigate = useNavigate();
    const {spots, status} = useSpotData();

    let callsign = params.callsign
    let grid = undefined

    if(!("callsign" in params)) {
        callsign = settings.callsign;
    }

    if(typeof callsign !== "string" || !isValidCallsign(callsign.trim())){
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
                <div id="spotTable">
                    <SpotTable spots={spots} />
                </div>
            </div>
            <div id="dashboardScreenFooter"><ConnectionStatusView /></div>

        </div>
    )
}