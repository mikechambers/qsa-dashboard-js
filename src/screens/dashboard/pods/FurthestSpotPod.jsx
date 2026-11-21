import { MAP_DISTANCE_RING_PALETTE } from "@/consts/config";
import { useSelectedSpot } from "@/contexts/SelectedSpotContext";
import { useSettings } from "@/contexts/SettingsContext";
import { DisplayMode } from "@/enums/DisplayMode";
import { SummaryBase } from "@/screens/dashboard/pods/PodBase";
import { convertAndFormatDistance } from "@/utils/view";

export const FurthestSpotPod = ({ furthestSpot }) => {
    const { setSelectedSpot } = useSelectedSpot();
    const { settings } = useSettings();

    const { d, unit } = furthestSpot
        ? convertAndFormatDistance(furthestSpot.distance, settings.unitType)
        : {};

    const subvalue = furthestSpot?.receiverCall
        ? `${furthestSpot?.receiverCall} · ${furthestSpot?.receiverDXCC?.countryCode?.toUpperCase()} · ${furthestSpot.snr} dB`
        : "";

    const theme = MAP_DISTANCE_RING_PALETTE[settings.displayMode];

    const onFurthestClick = () => {
        setSelectedSpot(furthestSpot);
    };

    return (
        <SummaryBase
            label="Furthest"
            value={d}
            unit={unit}
            onClick={onFurthestClick}
            swatchColor={theme?.furthest}
            subvalue={subvalue}
        />
    );
};
