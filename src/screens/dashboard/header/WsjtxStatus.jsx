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
import {
    IconWorldCheck,
    IconWorldExclamation,
    IconWorldX,
} from "@tabler/icons-react";
import { useWsjtx } from "@/contexts/WsjtxContext";
import { STATUS_ICON_SIZE } from "@/consts/config";

//the same colors and badges as the PSK Reporter status, on a world
const STATUS_STYLES = {
    connected: {
        color: "green",
        label: "WSJT-X connected",
        icon: IconWorldCheck,
    },
    waiting: {
        color: "yellow",
        label: "Waiting for WSJT-X",
        icon: IconWorldExclamation,
    },
    error: {
        color: "red",
        label: "WSJT-X not connected",
        icon: IconWorldX,
    },
};

//WSJT-X connection indicator. Desktop only
export const WsjtxStatus = () => {
    const { available, connected, error } = useWsjtx();

    if (!available) return null;

    //error means we can't listen at all, such as when the port is in use
    const state = error ? "error" : connected ? "connected" : "waiting";
    const { color, label, icon: Icon } = STATUS_STYLES[state];

    return (
        <Tooltip label={label}>
            <Icon
                size={STATUS_ICON_SIZE}
                color={`var(--mantine-color-${color}-6)`}
                aria-label={label}
            />
        </Tooltip>
    );
};
