/* MIT License
 *
 * Copyright (c) 2026 Mike Chambers
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
