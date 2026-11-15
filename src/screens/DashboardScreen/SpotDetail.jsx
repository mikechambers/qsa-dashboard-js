import { Paper, Stack, Group, SimpleGrid } from "@mantine/core";
import { TimeView } from "./TimeView";
import { IconArrowRight } from "@tabler/icons-react";
import { StatView } from "./StatView";
import { CallsignDetailView } from "./CallsignDetailView";
import { BandView } from "./BandView";
import { ModeView } from "./ModeView";
import { formatDistance, formatFrequency, formatTime } from "@/utils/view";
import { useSettings } from "../../context/SettingsContext";

export const SpotDetail = ({ spot }) => {
    let { settings } = useSettings();

    if (!spot) {
        return null;
    }

    const snr = `${spot?.snr} dB`;
    const frequency = `${formatFrequency(spot.frequency)} MHz`;

    let utcTime = formatTime(spot.date, true);

    const { d, unit } = formatDistance(spot.distance, settings.unitType);

    return (
        <Paper>
            <Stack gap="sm">
                {/* Row 1: header */}
                <Group gap="sm" wrap="nowrap" justify="space-between">
                    <Group>
                        <CallsignDetailView callsign={spot.senderCall} />
                        <IconArrowRight
                            size={16}
                            color="var(--mantine-color-dimmed)"
                        />
                        <CallsignDetailView callsign={spot.receiverCall} />
                    </Group>
                    <Group gap="xs" wrap="nowrap">
                        <BandView band={spot.band} />
                        <ModeView mode={spot.mode} />
                    </Group>
                </Group>

                {/* Row 2: stats */}
                <SimpleGrid cols={4} spacing="md" verticalSpacing="sm">
                    <StatView label="UTC" value={utcTime} />
                    <StatView label="SNR" value={snr} />
                    <StatView label="Frequency" value={frequency} />
                    <Group></Group>

                    <StatView label="Distance" value={`${d} ${unit}`} />
                    <StatView
                        label="Country"
                        value={spot?.receiverDXCC?.countryCode?.toUpperCase()}
                    />

                    <StatView
                        label="ITU zone"
                        value={spot?.receiverDXCC?.ituZone}
                    />
                    <StatView
                        label="CQ zone"
                        value={spot?.receiverDXCC?.cqZone}
                    />
                </SimpleGrid>
            </Stack>
        </Paper>
    );
};
