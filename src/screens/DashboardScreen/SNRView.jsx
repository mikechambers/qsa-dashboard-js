import { Text, Group } from "@mantine/core";
import { clamp } from "@/utils/math";

export const getColorForSnr = (snr) => {
    const s = clamp(snr, -24, 10);

    const hue = s < 0 ? ((s + 24) / 24) * 60 : 60 + (s / 10) * 60;

    return `hsl(${hue}, 100%, 50%)`;
};

export const SNRView = ({ snr }) => {
    return (
        <Group gap={8} justify="flex-end" wrap="nowrap" p={0}>
            <Text
                size="sm"
                ta="right"
                miw="44"
                style={{ fontVariantNumeric: "tabular-nums" }}
            >
                {snr}{" "}

                          <Text span size="xs" c="dimmed">
                dB
            </Text>
            </Text>
  
        </Group>
    );
};
