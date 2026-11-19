import { Stack, Text } from "@mantine/core";

export const SpotField = ({ label, value }) => {
    return (
        <Stack gap={2}>
            <Text
                size="xs"
                c="dimmed"
                fw={500}
                style={{ whiteSpace: "nowrap" }}
            >
                {label}
            </Text>
            <Text
                size="sm"
                fw={600}
                truncate="end"
                style={{
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                }}
            >
                {value}
            </Text>
        </Stack>
    );
};
