import { Box, Group } from "@mantine/core";

const BAR_HEIGHTS = [6, 10, 14];
const SNR_COLORS = { 3: "green.8", 2: "yellow.8", 1: "red.8" };
const LABELS = { 3: "Strong", 2: "Fair", 1: "Weak" };

const getLevel = (snr) => (snr >= -10 ? 3 : snr >= -18 ? 2 : 1);

export const SNRBarView = ({ snr }) => {
    const level = getLevel(snr);

    return (
        <Group
            gap={2}
            wrap="nowrap"
            align="flex-end"
            role="img"
            aria-label={`Signal: ${LABELS[level]}`}
        >
            {BAR_HEIGHTS.map((h, i) => (
                <Box
                    key={h}
                    w={4}
                    h={h}
                    bg={i < level ? SNR_COLORS[level] : "gray.3"}
                    style={{ borderRadius: 1 }}
                />
            ))}
        </Group>
    );
};
