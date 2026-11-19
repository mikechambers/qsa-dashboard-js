import { Stack, Text, Group, Box } from "@mantine/core";

export const SummaryBase = ({
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
                <Text size="xs" c="dimmed">
                    {subvalue}
                </Text>
            </Stack>
        </Box>
    );
};
