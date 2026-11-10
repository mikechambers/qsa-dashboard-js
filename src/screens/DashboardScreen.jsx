import { useParams } from "react-router";

import {CALLSIGN_STORAGE, GRID_STORAGE} from "@/config/"
import { useLocalStorage } from '@mantine/hooks';
import {useSettings} from "@/hooks/useSettings";
import {isValidCallsign, isValidMaidenHeadGrid, normalizeCallsign} from "@/utils/radio"

export default function DashboardScreen(props) {

    let params = useParams()
    let [settings] = useSettings()

    let callsign = params.callsign
    let grid = undefined

    //callsign params exist, it is a string, and its a valid callsigh

    if(typeof callsign !== "string" || !isValidCallsign(callsign.trim())) {
        callsign = settings.callsign;
    }

    callsign = normalizeCallsign(callsign)
    
    console.log(callsign)

    return(
        <div>Dashboard Screen {params.callsign}, {params.grid}</div>
    )
}