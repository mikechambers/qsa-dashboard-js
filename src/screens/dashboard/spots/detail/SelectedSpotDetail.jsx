import { useSelectedSpot } from "@/contexts/SelectedSpotContext";
import { SpotDetail } from "./SpotDetail";

export const SelectedSpotDetail = ({}) => {
    const { selectedSpot } = useSelectedSpot();

    return <SpotDetail spot={selectedSpot} />;
};
