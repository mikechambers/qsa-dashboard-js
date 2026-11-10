import { useParams } from "react-router";

import {CALLSIGN_STORAGE, GRID_STORAGE} from "@/config/"
import { useLocalStorage } from '@mantine/hooks';

export default function DashboardScreen(props) {

    let params = useParams()


    return(
        <div>Dashboard Screen {params.callsign}, {params.grid}</div>
    )
}