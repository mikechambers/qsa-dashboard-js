import {useSpotData} from "@/context/SpotDataContext";

export const ConnectionStatusView = (props) => {
    const {spots, status} = useSpotData();

    return(
        <div>{status}</div>
    )
}