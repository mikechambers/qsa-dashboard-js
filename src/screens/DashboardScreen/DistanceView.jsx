import { useSettings } from "@/context/SettingsContext";
import { UnitType } from "../../enums/UnitType";
import { metersToMiles } from "../../utils/geo";

export const DistanceView = ({ distance }) => {
    let { settings } = useSettings();

    let d = "-";

    console.log(settings.unitType)

    if (distance !== undefined) {
        if (settings.unitType === UnitType.IMPERIAL) {
            d = `${Math.round(metersToMiles(distance))} mi`;
        } else {
            d = `${Math.round(distance / 1000)} km`;
        }
    }

    return <div>{d}</div>;
};
