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

import { Group, Text, Paper, ActionIcon, Title, Button } from "@mantine/core";
import { ConnectionStatusBadge } from "./ConnectionStatusBadge";
import { IconInfoCircle } from "@tabler/icons-react";

import { normalizeCallsign, normalizeMaidenHeadGrid } from "@/utils/radio";

import { ABOUT_PATH } from "@/consts/config";
import { useNavigate } from "react-router";

import { useBreakpoint } from "@/hooks/useBreakpoint";

import { ClockContainer } from "./ClockContainer";
import { ControlContainer } from "./ControlContainer";
import { Breakpoint } from "@/enums/Breakpoint";
import { GithubIcon } from "@/screens/icons/GithubIcon";

export const HeaderContainer = ({ callsign, grid }) => {
    const breakpoint = useBreakpoint();
    const navigate = useNavigate();

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
                <Group wrap="nowrap" gap={16}>
                    <ConnectionStatusBadge breakpoint={breakpoint} />
                    <ControlContainer compact={compact} />
                    {/* 
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="lg"
                        component="a"
                        href="https://github.com/mikechambers/qsa-dashboard-js"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View project info and source on GitHub"
                        title="View project info and source on GitHub"
                    >
                        <GithubIcon size="100%" />
                    </ActionIcon>
                    */}
                </Group>
            </Group>
        </Paper>
    );
};
