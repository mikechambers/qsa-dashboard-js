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

import { Text, Group, Box, Paper, Tooltip } from "@mantine/core";
import { SignalColor } from "@/enums/SignalColors";

export const SNRLegend = ({ selectedSpot }) => {
    const snr = selectedSpot?.snr;
    const level = SignalColor.getColorForSNR(snr);

    return (
        <Paper
            withBorder
            radius="md"
            p="xs"
            pos="absolute"
            right={20}
            top={20}
            w={180}
        >
            <Group justify="space-between">
                <Text size="xs" fw={600} mb={8}>
                    Signal strength
                </Text>
            </Group>
            <Group gap={3} wrap="nowrap">
                {SignalColor.cases.map((name) => {
                    const active =
                        selectedSpot &&
                        name === SignalColor.getNameForSNR(selectedSpot.snr);
                    const color = SignalColor.getColor(name);
                    return (
                        <Tooltip
                            key={name}
                            label={SignalColor.getLabel(name)}
                            withArrow
                        >
                            <Box
                                h={6}
                                bg={SignalColor.getColor(name)}
                                style={{
                                    flex: "1 0 20px",
                                    borderRadius: 3,

                                    outline: active
                                        ? `1px solid ${color}`
                                        : "none",
                                    outlineOffset: 1,
                                    transition: "opacity 120ms",
                                }}
                            />
                        </Tooltip>
                    );
                })}
            </Group>
        </Paper>
    );
};
