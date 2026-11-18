import { useSelectedSpot } from "@/context/SelectedSpotContext";
import { useSettings } from "@/context/SettingsContext";
import { SummaryPodView } from "@/screens/DashboardScreen/summary/SummaryPodView";
import { convertAndFormatDistance } from "@/utils/view";

export const FurthestSpotPod = ({ furthestSpot }) => {
    const { selectedSpot, setSelectedSpot } = useSelectedSpot();
    const { settings } = useSettings();

    const { d, unit } = furthestSpot
        ? convertAndFormatDistance(furthestSpot.distance, settings.unitType)
        : {};

    const subvalue = `${furthestSpot.receiverCall} · ${furthestSpot.receiverDXCC.countryCode} · ${furthestSpot.snr} dB`;

    const onFurthestClick = () => {
        setSelectedSpot(furthestSpot);
    };

    return (
        <SummaryPodView
            label="Furthest"
            value={d}
            unit={unit}
            onClick={onFurthestClick}
            subvalue={subvalue}
        />
    );
};
