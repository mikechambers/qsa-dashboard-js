import { useSelectedSpot } from "../../context/SelectedSpotContext";
import { SpotDetail } from "./SpotDetail";

export const SelectedSpotDetail = ({}) => {
    const { selectedSpot, setSelectedSpot } = useSelectedSpot();

    return <SpotDetail spot={selectedSpot} />;
};
