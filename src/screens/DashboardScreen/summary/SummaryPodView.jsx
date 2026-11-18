import { Paper, Stack, Text, Group, Box } from "@mantine/core";

export const SummaryPodView = ({
    value,
    unit,
    label,
    subvalue,
    onClick,
    useMonospace,
}) => {
    const style = { cursor: onClick ? "pointer" : "auto" };

    const ff = useMonospace ? "monospace" : undefined;

    const c = () => {
        if (onClick) onClick();
    };
    return (
        <Box onClick={() => c()} style={style}>
            <Stack gap={4}>
                <Text size="xs" tt="uppercase" lts={0.5}>
                    {label}
                </Text>
                <Group gap={4} wrap="nowrap" align="baseline">
                    <Text fz={26} fw={600} lh={1.1} ff={ff}>
                        {value ?? "-"}
                    </Text>
                    {unit && (
                        <Text size="sm" fw={500} c="dimmed">
                            {unit}
                        </Text>
                    )}
                </Group>
                <Text
                    size="xs"
                    c="light-dark(var(--mantine-color-blue-9), var(--mantine-color-blue-3))"
                >
                    {subvalue}
                </Text>
            </Stack>
        </Box>
    );
};
