import { useParams } from "react-router";

import {CALLSIGN_STORAGE, GRID_STORAGE} from "@/config/"
import { useLocalStorage } from '@mantine/hooks';
import { useSettings } from "@/context/SettingsContext";
import {isValidCallsign, isValidMaidenHeadGrid, normalizeCallsign} from "@/utils/radio"
import { useNavigate } from 'react-router';

import "./DashboardScreen.css";

export default function DashboardScreen(props) {

    let params = useParams()
    let {settings} = useSettings()
    const navigate = useNavigate();

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
                <h1>Dashboard</h1>
            </div>
            <div id="dashboardScreenMain">{callsign} : {grid}</div>
            <div id="dashboardScreenFooter">Footer</div>

        </div>
    )
}