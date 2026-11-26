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
import { IconPinFilled } from "@tabler/icons-react";
import { STATION_TYPE_INFO } from "@/enums/StationType";
import { getCSSColorForSNR } from "@/utils/view";

import { BandBadge } from "../spots/BandBadge";
import { ModeField } from "../spots/ModeBadge";
import { CallsignField } from "../spots/detail/CallsignField";
import { STATION_COLORS } from "./config";

import classes from "./SpotPopup.module.css";

const UNKNOWN_COLOR = "var(--mantine-color-default-border)";
const signalColor = (report) =>
    report ? getCSSColorForSNR(report.snr) : UNKNOWN_COLOR;

const formatSNR = (report) => {
    if (!report) return "—";
    return report.snr > 0 ? `+${report.snr}` : `${report.snr}`;
};

//bar down the left side. Top is how they hear you, bottom how you hear them.
//One color if we can't know the second (web version)
const SignalBar = ({ theyHearYou, youHearThem, split }) => (
    <div className={classes.bar}>
        <div style={{ background: signalColor(theyHearYou) }} />
        {split && <div style={{ background: signalColor(youHearThem) }} />}
    </div>
);

const SignalBlock = ({ label, report }) => (
    <div className={classes.signal}>
        <Text size="xs" c="dimmed" tt="uppercase" className={classes.tileLabel}>
            {label}
        </Text>
        <Text fz={24} fw={700} lh={1.3}>
            {formatSNR(report)}
            {report && (
                <Text span size="xs" c="dimmed" fw={500}>
                    {" "}
                    dB
                </Text>
            )}
        </Text>
        <div
            className={classes.signalLine}
            style={{ background: signalColor(report) }}
        />
    </div>
);

//the detail card contents for a spot or a heard station. showYouHear is
//false where we can't know how we hear them (web version)
export const StationCard = ({
    type,
    status, //replaces the usual phrase, e.g. "Calling you"
    typeNote, //added to the phrase, e.g. "DX" or "POTA" for CQs
    call,
    country,
    mode,
    band,
    distance, //{ d, unit }
    frequency, //MHz, formatted
    theyHearYou,
    youHearThem,
    showYouHear = true,
    details, //grid and zones
    time,
    note,
    age, //how long ago they called, shown at the top
    action, //e.g. the Reply button
    onUnpin, //set when the card is pinned
    open,
    toggle,
}) => {
    const { name, phrase } = STATION_TYPE_INFO[type];

    const bar = (
        <SignalBar
            theyHearYou={theyHearYou}
            youHearThem={youHearThem}
            split={showYouHear}
        />
    );

    const typeTag = (
        <span
            className={classes.typeTag}
            style={{ background: STATION_COLORS[type] }}
        >
            {name}
        </span>
    );

    //collapsed: the essentials on one line
    if (!open) {
        return (
            <div className={classes.card}>
                {bar}
                <Group justify="space-between" wrap="nowrap" gap="xs">
                    <Group gap="xs" wrap="nowrap">
                        {typeTag}
                        <CallsignField callsign={call} />
                    </Group>
                    <Group gap="xs" wrap="nowrap">
                        <Text
                            size="sm"
                            c="dimmed"
                            style={{ whiteSpace: "nowrap" }}
                            title={
                                showYouHear
                                    ? "↑ they hear you · ↓ you hear them"
                                    : "they hear you"
                            }
                        >
                            {showYouHear
                                ? `↑ ${formatSNR(theyHearYou)} · ↓ ${formatSNR(youHearThem)} dB`
                                : `${formatSNR(theyHearYou)} dB`}
                        </Text>
                        {toggle}
                    </Group>
                </Group>
            </div>
        );
    }

    return (
        <div className={classes.card}>
            {bar}

            <Group justify="space-between" wrap="nowrap" gap={6}>
                <Group gap={6} wrap="nowrap">
                    {typeTag}
                    <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                        {[status ?? phrase, typeNote].filter(Boolean).join(" · ")}
                    </Text>
                </Group>
                <Group gap={4} wrap="nowrap">
                    {/* pinned cards need the room for the pin button */}
                    {onUnpin ? (
                        <ActionIcon
                            variant="default"
                            size="sm"
                            aria-label="Unpin station"
                            title="Unpin"
                            onClick={onUnpin}
                        >
                            <IconPinFilled size={14} />
                        </ActionIcon>
                    ) : (
                        <>
                            {mode && <ModeField mode={mode} />}
                            {band && <BandBadge band={band} />}
                        </>
                    )}
                    {toggle}
                </Group>
            </Group>

            <Group gap={8} mt={6} align="baseline" wrap="nowrap">
                <CallsignField callsign={call} size="xl" />
                <Text size="sm" c="dimmed" truncate style={{ flex: 1 }}>
                    {country}
                </Text>
                {age && (
                    <Text size="sm" fw={700} style={{ whiteSpace: "nowrap" }}>
                        {age}
                    </Text>
                )}
            </Group>

            <div
                className={classes.signals}
                style={showYouHear ? undefined : { gridTemplateColumns: "1fr" }}
            >
                <SignalBlock label="They hear you" report={theyHearYou} />
                {showYouHear && (
                    <SignalBlock label="You hear them" report={youHearThem} />
                )}
            </div>

            <Stack gap={4} mt={8}>
                <Group
                    justify="space-between"
                    wrap="nowrap"
                    className={classes.facts}
                >
                    <Text size="sm">
                        <b>{distance?.d ?? "-"}</b> {distance?.unit}
                    </Text>
                    {frequency && (
                        <Text size="sm">
                            <b>{frequency}</b> MHz
                        </Text>
                    )}
                </Group>
                <Group justify="space-between" wrap="nowrap" gap="xs">
                    <Text size="xs" c="dimmed">
                        {details}
                    </Text>
                    <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                        {time}
                    </Text>
                </Group>
                {note && (
                    <Text size="xs" c="dimmed">
                        {note}
                    </Text>
                )}
            </Stack>

            {action}
        </div>
    );
};
