import { Paper, Stack, Text } from "@mantine/core";

export const SummaryPodView = ({ value, label }) => {
    return (
        <Paper>
            <Stack gap={1}>
                <Text fz={28} fw={500}>
                    {value}
                </Text>
                <Text size="sm" c="dimmed">
                    {label}
                </Text>
            </Stack>
        </Paper>
    );
};
