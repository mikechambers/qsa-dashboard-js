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

import { Divider, Group, Paper } from "@mantine/core";
import { useWsjtx } from "@/contexts/WsjtxContext";
import { Band } from "@/enums/Band";
import { StationType } from "@/enums/StationType";
import { useActiveStations } from "@/hooks/useActiveStations";
import { STATION_EXPIRY_MS, isMappable } from "@/utils/activeStations";
import { formatFrequency } from "@/utils/view";
import { SummaryBase } from "./PodBase";

//what WSJT-X is doing: frequency, who we are working and CQs. Desktop only
export const WsjtxPod = () => {
    const { available, connected, status, decodes } = useWsjtx();
    const cqs = useActiveStations()
        .filter((s) => s.type === StationType.CQ)
        .map((s) => s.decode);

    if (!available) return null;

    const frequency = formatFrequency(status?.dialFrequency);
    const radio = [
        status && Band.fromFrequency(status.dialFrequency),
        status?.mode,
        status?.transmitting && "TX",
    ]
        .filter(Boolean)
        .join(" · ");

    const recent = decodes.filter(
        (d) => Date.now() - d.receivedAt.getTime() <= STATION_EXPIRY_MS,
    ).length;

    return (
        <Paper withBorder radius="md">
            <Group gap={20} align="stretch">
                <SummaryBase
                    label="WSJT-X"
                    value={frequency || undefined}
                    unit={frequency ? "MHz" : undefined}
                    subvalue={connected ? radio : "not connected"}
                />
                <Divider orientation="vertical" />
                <SummaryBase
                    label="Working"
                    value={status?.dxCall || undefined}
                    subvalue={status?.dxCall ? status.dxGrid : ""}
                />
                <Divider orientation="vertical" />
                <SummaryBase
                    label="CQ calls"
                    value={connected ? cqs.length : undefined}
                    subvalue={
                        connected
                            ? `${cqs.filter(isMappable).length} on map · ${recent} decodes`
                            : ""
                    }
                />
            </Group>
        </Paper>
    );
};
