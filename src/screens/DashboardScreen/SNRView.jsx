import { Text, Group } from "@mantine/core";
import { SNRBarView } from "./SNRBarView";

export const SNRView = ({ snr }) => {
    return (
        <Group gap={4} justify="flex-end" wrap="nowrap" p={0}>
            <SNRBarView snr={snr} />
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
