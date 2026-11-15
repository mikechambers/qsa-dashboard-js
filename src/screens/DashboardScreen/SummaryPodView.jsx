import { Paper, Stack, Text, Group } from "@mantine/core";

export const SummaryPodView = ({ value, unit, label }) => {
    return (
        <Paper>
            <Stack gap={0}>
                <Group wrap="nowrap" gap={1}>
                    <Text fz={40} fw={500} lh={1}>
                        {value}
                        {unit && (
                            <Text span size="lg" c="dimmed" ml={4} ff="text">
                                {unit}
                            </Text>
                        )}
                    </Text>
                </Group>
                <Text
                    size="sm"
                    tt="uppercase"
                    c="dimmed"
                    lts={0.5}
                    mt={2}
                    lh={1}
                >
                    {label}
                </Text>
            </Stack>
        </Paper>
    );
};
