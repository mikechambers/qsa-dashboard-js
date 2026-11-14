import { useSettings } from "@/context/SettingsContext";
import { UnitType } from "../../enums/UnitType";
import { metersToMiles } from "../../utils/geo";
import { Text } from "@mantine/core";

export const DistanceView = ({ distance }) => {
    let { settings } = useSettings();

    let d = "-";
    let unit = "km"

    if (distance !== undefined) {
        if (settings.unitType === UnitType.IMPERIAL) {
            d = `${Math.round(metersToMiles(distance))}`;
            unit = " mi";
        } else {
            d = `${Math.round(distance / 1000)}`;
            unit = " km";
        }
    }

    return (
        <Text size="sm" style={{ fontVariantNumeric: "tabular-nums" }}>
            {d}
            <Text span size="xs" c="dimmed">
                 {unit}
            </Text>
        </Text>
    );
};
