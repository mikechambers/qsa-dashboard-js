import { Group, Text } from "@mantine/core";

import { useSettings } from "@/contexts/SettingsContext";
import { convertAndFormatDistance, formatTime } from "@/utils/view";
import { getShortTimeZoneName, timeAgo } from "@/utils/date";

import { BandBadge } from "../spots/BandBadge";
import { ModeField } from "../spots/ModeBadge";
import { SNRBar } from "../spots/SNRBar";
import { CallsignField } from "../spots/detail/CallsignField";

import classes from "./SpotPopup.module.css";

//small card shown above the selected spot on the map
export const SpotPopup = ({ spot }) => {
    const { settings } = useSettings();

    const { d, unit } = convertAndFormatDistance(
        spot.distance,
        settings.unitType,
    );

    const time = formatTime(spot.date, settings.timeMode);
    const timeZone = getShortTimeZoneName(settings.timeMode);
    const ago = timeAgo(spot.date);

    return (
        <div className={classes.card}>
            <Group gap="md" justify="space-between" wrap="nowrap">
                <CallsignField callsign={spot.receiverCall} />
                <Group gap={4} wrap="nowrap">
                    <BandBadge band={spot.band} />
                    <ModeField mode={spot.mode} />
                </Group>
            </Group>

            <Group gap="md" mt={6} wrap="nowrap" justify="space-between">
                <Text size="sm">
                    {d} {unit}
                </Text>
                <Group gap={6} wrap="nowrap">
                    <SNRBar snr={spot.snr} />
                    <Text
                        size="sm"
                        fw={500}
                        style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                        {spot.snr} dB
                    </Text>
                </Group>
            </Group>

            <Text size="xs" c="dimmed" mt={6} justify="center">
                {time} {timeZone}
                {ago && ` · ${ago}`}
            </Text>
        </div>
    );
};
