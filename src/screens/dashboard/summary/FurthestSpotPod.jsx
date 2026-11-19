import { useSelectedSpot } from "@/contexts/SelectedSpotContext";
import { useSettings } from "@/contexts/SettingsContext";
import { SummaryPodView } from "@/screens/dashboard/summary/SummaryPodView";
import { convertAndFormatDistance } from "@/utils/view";

export const FurthestSpotPod = ({ furthestSpot }) => {
    const { setSelectedSpot } = useSelectedSpot();
    const { settings } = useSettings();

    const { d, unit } = furthestSpot
        ? convertAndFormatDistance(furthestSpot.distance, settings.unitType)
        : {};

    const subvalue = furthestSpot?.receiverCall
        ? `${furthestSpot.receiverCall} · ${furthestSpot.receiverDXCC.countryCode.toUpperCase()} · ${furthestSpot.snr} dB`
        : "";

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
