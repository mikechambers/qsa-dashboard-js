import { Group, Text } from "@mantine/core";

export const SummaryChartBase = ({ children, label }) => {
    return (
        <Group gap="sm" wrap="wrap" align="center" pos="relative">
            {children}
            <Text
                size="xs"
                tt="uppercase"
                lts={0.5}
                pos="absolute"
                left="50%"
                bottom={-6}
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
