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

import { Group, Stack, Text } from "@mantine/core";

import { useSettings } from "@/contexts/SettingsContext";
import {
    convertAndFormatDistance,
    formatFrequency,
    formatTime,
    getCSSColorForSNR,
} from "@/utils/view";
import { getShortTimeZoneName, timeAgo } from "@/utils/date";

import { BandBadge } from "../spots/BandBadge";
import { ModeField } from "../spots/ModeBadge";
import { CallsignField } from "../spots/detail/CallsignField";

import classes from "./SpotPopup.module.css";

//one labelled value in the row of stats
const Tile = ({ label, value, unit }) => (
    <div className={classes.tile}>
        <Text size="xs" c="dimmed" tt="uppercase" className={classes.tileLabel}>
            {label}
        </Text>
        <Text fw={700} style={{ whiteSpace: "nowrap" }}>
            {value}
            {unit && (
                <>
                    {" "}
                    <Text span size="xs" c="dimmed" fw={500}>
                        {unit}
                    </Text>
                </>
            )}
        </Text>
    </div>
);

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

    const frequency = formatFrequency(spot.frequency);
    const dxcc = spot.receiverDXCC;
    const grid = spot.receiverLocation?.grid;
    const zones = [
        grid,
        dxcc?.ituZone != null && `ITU ${dxcc.ituZone}`,
        dxcc?.cqZone != null && `CQ ${dxcc.cqZone}`,
    ].filter(Boolean);

    return (
        <div className={classes.card}>
            <div
                className={classes.bar}
                style={{ background: getCSSColorForSNR(spot.snr) }}
            />

            <Group
                gap="md"
                justify="space-between"
                align="flex-start"
                wrap="nowrap"
            >
                <Stack gap={2}>
                    <CallsignField callsign={spot.receiverCall} />
                    <Text size="sm" c="dimmed">
                        {dxcc?.shortName}
                    </Text>
                </Stack>
                <Group gap={4} wrap="nowrap">
                    <ModeField mode={spot.mode} />
                    <BandBadge band={spot.band} />
                </Group>
            </Group>

            <div className={classes.tiles}>
                <Tile label="Distance" value={d} unit={unit} />
                <Tile label="Signal" value={spot.snr} unit="dB" />
                <Tile
                    label="Freq"
                    value={frequency}
                    unit={frequency ? "MHz" : undefined}
                />
            </div>

            <Group gap="md" mt={8} wrap="nowrap" justify="space-between">
                <Text size="xs" c="dimmed">
                    {zones.join(" · ")}
                </Text>
                <Text size="xs" c="dimmed">
                    {time} {timeZone}
                    {ago && ` · ${ago}`}
                </Text>
            </Group>
        </div>
    );
};
