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

import { ActionIcon, Group, Stack, Text } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

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

//detail card, always at the top right of the map. Shows the selected spot, and
//can be collapsed to a single line.
export const SpotPopup = ({ spot, open, onOpenChange }) => {
    const { settings } = useSettings();

    const toggle = (
        <ActionIcon
            variant="default"
            size="sm"
            aria-label={open ? "Collapse spot details" : "Expand spot details"}
            title={open ? "Collapse" : "Expand"}
            onClick={() => onOpenChange(!open)}
        >
            {open ? (
                <IconChevronUp size={16} />
            ) : (
                <IconChevronDown size={16} />
            )}
        </ActionIcon>
    );

    //nothing selected yet
    if (!spot) {
        return (
            <div className={classes.popup}>
                <div className={`${classes.card} ${classes.empty}`}>
                    <Group justify="space-between" wrap="nowrap">
                        <Text size="sm" c="dimmed">
                            {open
                                ? "Hover or click a spot to see its details"
                                : "Spot details"}
                        </Text>
                        {toggle}
                    </Group>
                </div>
            </div>
        );
    }

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
        <div className={classes.popup}>
            <div className={classes.card}>
                <div
                    className={classes.bar}
                    style={{ background: getCSSColorForSNR(spot.snr) }}
                />

                {open ? (
                    <>
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
                            <Group gap={4} wrap="nowrap" align="center">
                                <ModeField mode={spot.mode} />
                                <BandBadge band={spot.band} />
                                {toggle}
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

                        <Group
                            gap="md"
                            mt={8}
                            wrap="nowrap"
                            justify="space-between"
                        >
                            <Text size="xs" c="dimmed">
                                {zones.join(" · ")}
                            </Text>
                            <Text size="xs" c="dimmed">
                                {time} {timeZone}
                                {ago && ` · ${ago}`}
                            </Text>
                        </Group>
                    </>
                ) : (
                    //collapsed: the essentials on one line
                    <Group justify="space-between" wrap="nowrap">
                        <Group gap="sm" wrap="nowrap" align="baseline">
                            <CallsignField callsign={spot.receiverCall} />
                            <Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                                {[
                                    dxcc?.countryCode?.toUpperCase(),
                                    `${d} ${unit}`,
                                    `${spot.snr} dB`,
                                ]
                                    .filter(Boolean)
                                    .join(" · ")}
                            </Text>
                        </Group>
                        {toggle}
                    </Group>
                )}
            </div>
        </div>
    );
};
