import { Text } from "@mantine/core";
import { formatTime } from "@/utils/view";
import { useSettings } from "../../contexts/SettingsContext";

export const TimeView = ({ date }) => {
    const { settings } = useSettings();

    let time = formatTime(date, settings.timeMode);

    return (
        <Text size="sm" c="dimmed" fw={500}>
            {time ?? ""}
        </Text>
    );
};
