import { Text, Group } from "@mantine/core";
import { clamp } from "@/utils/math";

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
                <Text span size="xs" c="dimmed" fw={500}>
                    dB
                </Text>
            </Text>
        </Group>
    );
};
