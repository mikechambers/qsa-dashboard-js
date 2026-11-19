import { Text, Group, Box, Paper, Tooltip } from "@mantine/core";
import { SignalColor } from "@/enums/SignalColors";

export const SNRLegend = () => {
    return (
        <Paper
            withBorder
            radius="md"
            p="xs"
            pos="absolute"
            right={20}
            top={20}
            w={140}
        >
            <Text size="xs" fw={600} mb={8}>
                Signal strength
            </Text>
            <Group gap={3} wrap="nowrap">
                {SignalColor.cases.map((name) => (
                    <Tooltip
                        key={name}
                        label={SignalColor.getLabel(name)}
                        withArrow
                    >
                        <Box
                            h={6}
                            bg={SignalColor.getColor(name)}
                            style={{ flex: "1 0 20px", borderRadius: 3 }}
                        />
                    </Tooltip>
                ))}
            </Group>
        </Paper>
    );
};
