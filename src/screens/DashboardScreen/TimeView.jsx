import { Text } from "@mantine/core";
import { formatTime } from "@/utils/view";

export const TimeView = ({ date }) => {
    let utcTime = formatTime(date);

    return (
        <Text size="sm" c="dimmed" fw={500}>
            {utcTime ?? ""}
        </Text>
    );
};
