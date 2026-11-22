import { Text, Group, Box, Paper, Tooltip } from "@mantine/core";
import { SignalColor } from "@/enums/SignalColors";

export const SNRLegend = ({ selectedSpot }) => {
    const snr = selectedSpot?.snr;
    const level = SignalColor.getColorForSNR(snr);

    return (
        <Paper
            withBorder
            radius="md"
            p="xs"
            pos="absolute"
            right={20}
            top={20}
            w={180}
        >
            <Group justify="space-between">
                <Text size="xs" fw={600} mb={8}>
                    Signal strength
                </Text>
            </Group>
            <Group gap={3} wrap="nowrap">
                {SignalColor.cases.map((name) => {
                    const active =
                        selectedSpot &&
                        name === SignalColor.getNameForSNR(selectedSpot.snr);
                    const color = SignalColor.getColor(name);
                    return (
                        <Tooltip
                            key={name}
                            label={SignalColor.getLabel(name)}
                            withArrow
                        >
                            <Box
                                h={6}
                                bg={SignalColor.getColor(name)}
                                style={{
                                    flex: "1 0 20px",
                                    borderRadius: 3,

                                    outline: active
                                        ? `1px solid ${color}`
                                        : "none",
                                    outlineOffset: 1,
                                    transition: "opacity 120ms",
                                }}
                            />
                        </Tooltip>
                    );
                })}
            </Group>
        </Paper>
    );
};
