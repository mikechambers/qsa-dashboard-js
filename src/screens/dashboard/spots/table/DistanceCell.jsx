import { useSettings } from "@/contexts/SettingsContext";

import { Text, Group } from "@mantine/core";
import { convertAndFormatDistance } from "@/utils/view";

export const DistanceCell = ({ distance }) => {
    let { settings } = useSettings();

    let { d, unit } = convertAndFormatDistance(distance, settings.unitType);

    return (
        <Group wrap="nowrap" gap={4} align="flex-end" justify="flex-end">
            <Text size="sm" style={{ fontVariantNumeric: "tabular-nums" }}>
                {d}
            </Text>
            <Text span size="xs" c="dimmed" fw={500}>
                {unit}
            </Text>
        </Group>
    );
};
