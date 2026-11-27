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

import { Group, Text, Paper, Title } from "@mantine/core";
import { ConnectionStatusBadge } from "./ConnectionStatusBadge";

import { normalizeCallsign, normalizeMaidenHeadGrid } from "@/utils/radio";

import { useBreakpoint } from "@/hooks/useBreakpoint";

import { ClockContainer } from "./ClockContainer";
import { ControlContainer } from "./ControlContainer";
import { WsjtxStatus } from "./WsjtxStatus";
import { Breakpoint } from "@/enums/Breakpoint";
import { Platform } from "@/enums/Platform";
import { PLATFORM } from "@/utils/platform";

export const HeaderContainer = ({ callsign, grid }) => {
    const breakpoint = useBreakpoint();

    //todo: maybe normalize when we save?
    const cs = normalizeCallsign(callsign);
    const g = normalizeMaidenHeadGrid(grid);

    const compact = breakpoint === Breakpoint.COMPACT;

    return (
        <Paper>
            <Group justify="space-between" wrap="nowrap">
                <Group gap="xs" align="baseline" wrap="nowrap">
                    <Title order={2} ff="monospace">
                        {cs}
                    </Title>
                    <Text fz="md" fw={500} c="dimmed" ff="monospace">
                        {g}
                    </Text>
                </Group>

                <ClockContainer breakpoint={breakpoint} />
                <Group wrap="nowrap" gap={8}>
                    <WsjtxStatus />
                    <ConnectionStatusBadge breakpoint={breakpoint} />
                    {/* the desktop app has these in its menu */}
                    {PLATFORM !== Platform.DESKTOP && (
                        <ControlContainer compact={compact} />
                    )}
                </Group>
            </Group>
        </Paper>
    );
};
