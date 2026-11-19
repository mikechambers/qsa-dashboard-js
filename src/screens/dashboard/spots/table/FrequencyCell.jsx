import { Text } from "@mantine/core";
import { formatFrequency } from "@/utils/view";

export const FrequencyCell = ({ frequency }) => {
    let f = formatFrequency(frequency);

    return (
        <Text
            size="xs"
            c="dimmed"
            fw={500}
            style={{ fontVariantNumeric: "tabular-nums" }}
        >
            {f}
        </Text>
    );
};
