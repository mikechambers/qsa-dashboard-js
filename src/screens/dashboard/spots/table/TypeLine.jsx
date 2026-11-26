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
import { STATION_TYPE_INFO } from "@/enums/StationType";
import { shortAge } from "@/utils/tableRows";
import { STATION_COLORS } from "../../map/config";
import { TypeIcon } from "../../map/TypeIcon";

//under the callsign: what the row is, and how old
export const TypeLine = ({ type, date }) => (
    <Group gap={4} wrap="nowrap">
        <TypeIcon type={type} size={0.55} />
        <Text
            size="xs"
            fw={600}
            c={STATION_COLORS[type]}
            style={{ whiteSpace: "nowrap" }}
        >
            {STATION_TYPE_INFO[type].name} · {shortAge(date)}
        </Text>
    </Group>
);
