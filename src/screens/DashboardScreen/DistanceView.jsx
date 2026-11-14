import { useSettings } from "@/context/SettingsContext";

import { Text } from "@mantine/core";
import { formatDistance } from "@/utils/view";

export const DistanceView = ({ distance }) => {
    let { settings } = useSettings();

    let { d, unit } = formatDistance(distance, settings.unitType);

    return (
        <Text size="sm" style={{ fontVariantNumeric: "tabular-nums" }}>
            {d}
            <Text span size="xs" c="dimmed" fw={500}>
                {unit}
            </Text>
        </Text>
    );
};
