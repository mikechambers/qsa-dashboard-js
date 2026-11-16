import { Text, Group, Box, Paper, Tooltip } from "@mantine/core";
import { SignalColor } from "../../enums/SignalColors";

export const SNRKeyView = () => {
    return (
        <Paper
            withBorder
            radius="md"
            p="xs"
            pos="absolute"
            left={50}
            bottom={10}
            w={180}
        >
            <Group gap={3} w={152} wrap="nowrap">
                {SignalColor.cases.map((name) => (
                    <Tooltip
                        key={name}
                        label={SignalColor.getLabel(name)}
                        withArrow
                    >
                        <Box
                            h={6}
                            bg={SignalColor.getColor(name)}
                            style={{ flex: "1 0 24px", borderRadius: 3 }}
                        />
                    </Tooltip>
                ))}
            </Group>

            <Group justify="space-between" w={152} mt={6}>
                <Text size="xs" fw={600}>
                    Very weak
                </Text>
                <Text size="xs" fw={600}>
                    Strong
                </Text>
            </Group>
        </Paper>
    );
};
