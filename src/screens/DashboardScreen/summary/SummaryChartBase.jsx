import { Group, Text } from "@mantine/core";

export const SummaryChartBase = ({ children, label }) => {
    return (
        <Group gap="sm" wrap="wrap" align="center" pos="relative">
            {children}
            <Text
                fz="xs"
                lh={0.6}
                pos="absolute"
                left="50%"
                bottom={0}
                tt="uppercase"
                c="dimmed"
                style={{
                    transform: "translateX(-50%)",
                    pointerEvents: "none",
                }}
            >
                {label}
            </Text>
        </Group>
    );
};
