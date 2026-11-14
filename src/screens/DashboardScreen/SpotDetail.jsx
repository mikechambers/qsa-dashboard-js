import { Paper, Stack, Group, Text } from "@mantine/core";
import { TimeView } from "./TimeView";
import { IconArrowRight } from "@tabler/icons-react";
import { StatView } from "./StatView";
import { CallsignDetailView } from "./CallsignDetailView";
import { BandView } from "./BandView";
import { ModeView } from "./ModeView";

export const SpotDetail = ({ spot }) => {
    if (!spot) {
        return null;
    }

    const snr = `${spot?.snr} dB`;
    const frequency = `${spot?.frequency} MHz`;

    let utcTime = "";
    if (spot?.time) {
        utcTime =
            new Intl.DateTimeFormat("en-GB", {
                timeZone: "UTC",
                hour: "2-digit",
                minute: "2-digit",

                hourCycle: "h23",
            }).format(spot.time) + " UTC";
    }

    return (
        <Paper>
            <Stack gap="sm">
                {/* Row 1: header */}
                <Group gap="sm" wrap="nowrap" justify="space-between">
                    <CallsignDetailView callsign={spot.senderCall} />
                    <IconArrowRight
                        size={16}
                        color="var(--mantine-color-dimmed)"
                    />
                    <CallsignDetailView callsign={spot.receiverCall} />
                    <Text size="sm" c="dimmed">
                        {spot?.receiverDXCC.countryCode}
                    </Text>
                    <Group gap="xs" wrap="nowrap">
                        <BandView band={spot.band} />
                        <ModeView mode={spot.mode} />
                    </Group>
                </Group>

                {/* Row 2: stats */}
                <Group>
                    <StatView label="SNR" value={snr} />
                    <StatView label="Distance" value={spot.distance} />
                    <StatView label="Frequency" value={frequency} />
                    <StatView label="Time" value={utcTime} />
                    <StatView
                        label="ITU zone"
                        value={spot?.receiverDXCC.ituZone}
                    />
                    <StatView
                        label="CQ zone"
                        value={spot?.receiverDXCC.cqZone}
                    />
                </Group>
            </Stack>
        </Paper>
    );
};
