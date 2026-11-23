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

import {
    Paper,
    Stack,
    Group,
    SimpleGrid,
    EmptyState,
    Center,
    Box,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { SpotField } from "./SpotField";
import { CallsignField } from "./CallsignField";
import { BandBadge } from "../BandBadge";
import { ModeField } from "../ModeBadge";
import {
    convertAndFormatDistance,
    formatFrequency,
    formatTime,
    getCSSColorForSNR,
} from "@/utils/view";
import { useSettings } from "../../../../contexts/SettingsContext";
import { getShortTimeZoneName } from "../../../../utils/date";

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
            <Group h="100%" align="stretch" wrap="nowrap" gap="sm">
                <Box
                    mt={8}
                    w={4}
                    style={{
                        background: getCSSColorForSNR(spot.snr),
                        borderRadius: 2,
                    }}
                />
                <Stack gap="sm">
                    {/* Row 1: header */}
                    <Group gap="sm" wrap="nowrap" justify="space-between">
                        <Group>
                            <CallsignField callsign={spot.senderCall} />
                            <IconArrowRight
                                size={16}
                                color="var(--mantine-color-dimmed)"
                            />
                            <CallsignField callsign={spot.receiverCall} />
                        </Group>
                        <Group gap="xs" wrap="nowrap">
                            <BandBadge band={spot.band} />
                            <ModeField mode={spot.mode} />
                        </Group>
                    </Group>

                    {/* Row 2: stats */}
                    <SimpleGrid cols={4} spacing="md" verticalSpacing="sm">
                        <SpotField label={timeZone} value={time} />
                        <SpotField label="SNR" value={snr} />
                        <SpotField label="Frequency" value={frequency} />
                        <Group></Group>

                        <SpotField label="Distance" value={`${d} ${unit}`} />
                        <SpotField
                            label="Location"
                            value={spot?.receiverDXCC?.shortName}
                        />

                        <SpotField
                            label="ITU zone"
                            value={spot?.receiverDXCC?.ituZone}
                        />
                        <SpotField
                            label="CQ zone"
                            value={spot?.receiverDXCC?.cqZone}
                        />
                    </SimpleGrid>
                </Stack>
            </Group>
        </Paper>
    );
};
