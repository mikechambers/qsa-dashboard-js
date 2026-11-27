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

import { Tooltip } from "@mantine/core";
import { useSpotData } from "@/contexts/SpotDataContext";
import { ConnectionStatus as CS } from "@/enums/ConnectionStatus";
import {
    IconCloudCheck,
    IconCloudExclamation,
    IconCloudX,
} from "@tabler/icons-react";
import { STATUS_ICON_SIZE } from "@/consts/config";

const STATUS_STYLES = {
    [CS.CONNECTED]: {
        color: "green",
        label: "Connected",
        icon: IconCloudCheck,
    },
    [CS.CONNECTING]: {
        color: "yellow",
        label: "Connecting",
        icon: IconCloudExclamation,
    },
    [CS.DISCONNECTED]: {
        color: "red",
        label: "Disconnected",
        icon: IconCloudX,
    },
};

export const ConnectionStatusBadge = () => {
    const { status } = useSpotData();

    const { color, label, icon: Icon } = STATUS_STYLES[status];

    return (
        <Tooltip label={`PSK Reporter: ${label}`}>
            <Icon
                size={STATUS_ICON_SIZE}
                color={`var(--mantine-color-${color}-6)`}
            />
        </Tooltip>
    );
};
