import { Stack, Text } from "@mantine/core";

export const StatView = ({ label, value }) => {
    return (
        <Stack gap={2}>
            <Text size="xs" c="dimmed" fw={500}>
                {label}
            </Text>
            <Text
                size="sm"
                fw={600}
                style={{ fontVariantNumeric: "tabular-nums" }}
            >
                {value}
            </Text>
        </Stack>
    );
};
