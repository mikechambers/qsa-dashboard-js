import { Text } from "@mantine/core";
import { formatTime } from "@/utils/view";

export const TimeView = ({ date }) => {
    console.log(date);
    let utcTime = formatTime(date);
    console.log(utcTime);

    return (
        <Text size="sm" c="dimmed" fw={500}>
            {utcTime ?? ""}
        </Text>
    );
};
