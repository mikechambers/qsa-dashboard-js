import { useParams } from "react-router";

import {CALLSIGN_STORAGE, GRID_STORAGE} from "@/config/"
import { useLocalStorage } from '@mantine/hooks';
import {useSettings} from "@/hooks/useSettings";
import {isValidCallsign, isValidMaidenHeadGrid, normalizeCallsign} from "@/utils/radio"
import { useNavigate } from 'react-router'; 

export default function DashboardScreen(props) {

    let params = useParams()
    let [settings] = useSettings()
    const navigate = useNavigate();

    let callsign = params.callsign
    let grid = undefined

    if(!("callsign" in params)) {
        console.log("using saved callsign")
        callsign = settings.callsign;
    }

    if(typeof callsign !== "string" || !isValidCallsign(callsign.trim())){
        callsign = normalizeCallsign(callsign)
    } else {
        navigate("/")
    }

    console.log(callsign)

    return(
        <div>Dashboard Screen {callsign}, {grid}</div>
    )
}