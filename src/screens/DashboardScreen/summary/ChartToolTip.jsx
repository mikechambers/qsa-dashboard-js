import { Box, useComputedColorScheme } from "@mantine/core";

export const ChartTooltip = ({ children }) => {
    const isDark = useComputedColorScheme("light") === "dark";
    return (
        <Box
            px="xs"
            py={5}
            style={{
                background: isDark
                    ? "var(--mantine-color-gray-2)"
                    : "var(--mantine-color-gray-9)",
                color: isDark
                    ? "var(--mantine-color-black)"
                    : "var(--mantine-color-white)",
                borderRadius: "var(--mantine-radius-sm)",
                fontVariantNumeric: "tabular-nums",
            }}
        >
            {children}
        </Box>
    );
};
