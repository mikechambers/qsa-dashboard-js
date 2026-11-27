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

import { SegmentedControl, Stack, Group, Text, Tooltip } from "@mantine/core";
import { STATION_TYPE_INFO, STATION_TYPE_LIST } from "@/enums/StationType";
import { TableTab } from "@/enums/TableTab";
import { TypeIcon } from "../../map/TypeIcon";

//All, then one for each type
const TABS = [
    { value: TableTab.ALL, name: "All", description: "All" },
    ...STATION_TYPE_LIST.map((type) => ({
        value: type,
        name: STATION_TYPE_INFO[type].plural,
        description: STATION_TYPE_INFO[type].description,
        type,
    })),
];

//counts is the number of rows for each tab
export const TableTabs = ({ value, onChange, counts }) => (
    <SegmentedControl
        fullWidth
        size="xs"
        value={value}
        onChange={onChange}
        data={TABS.map(({ value, name, type, description }) => ({
            value,
            label: (
                <Stack gap={0} align="center">
                    <Tooltip label={description}>
                        <span>
                            <Group gap={4} wrap="nowrap" h={18}>
                                {type && <TypeIcon type={type} size={0.55} />}
                                <Text size="sm" fw={600}>
                                    {name}
                                </Text>
                            </Group>
                            <Text
                                size="xs"
                                c="dimmed"
                                style={{ fontVariantNumeric: "tabular-nums" }}
                            >
                                {counts[value]}
                            </Text>
                        </span>
                    </Tooltip>
                </Stack>
            ),
        }))}
    />
);
