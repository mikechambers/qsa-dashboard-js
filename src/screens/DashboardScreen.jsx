import { useParams } from "react-router";

export default function DashboardScreen(props) {

    let params = useParams()

    return(
        <div>Dashboard Screen {params.callsign}, {params.grid}</div>
    )
}