import {
    Paper,
    Stack,
    Group,
    SimpleGrid,
    EmptyState,
    Center,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { StatView } from "./StatView";
import { CallsignDetailView } from "./CallsignDetailView";
import { BandView } from "./BandView";
import { ModeView } from "./ModeView";
import {
    convertAndFormatDistance,
    formatFrequency,
    formatTime,
} from "@/utils/view";
import { useSettings } from "../../context/SettingsContext";
import { getShortTimeZoneName } from "../../utils/date";

export const SpotDetail = ({ spot }) => {
    let { settings } = useSettings();

    if (!spot) {
        return (
            <Paper p={0} h={150}>
                <Center h="100%">
                    <EmptyState
                        title="Spot Detail"
                        description="Selected spot details will appear here."
                    />
                </Center>
            </Paper>
        );
    }

    const snr = `${spot?.snr} dB`;
    const frequency = `${formatFrequency(spot.frequency)} MHz`;

    let timeZone = getShortTimeZoneName(settings.timeMode);
    let time = formatTime(spot.date, settings.timeMode, true);

    const { d, unit } = convertAndFormatDistance(
        spot.distance,
        settings.unitType,
    );

    return (
        <Paper h={150}>
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
                    <StatView label={timeZone} value={time} />
                    <StatView label="SNR" value={snr} />
                    <StatView label="Frequency" value={frequency} />
                    <Group></Group>

                    <StatView label="Distance" value={`${d} ${unit}`} />
                    <StatView
                        label="Location"
                        value={spot?.receiverDXCC?.shortName}
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
