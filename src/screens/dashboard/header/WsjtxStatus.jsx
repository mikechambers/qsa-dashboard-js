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
import { IconBroadcast, IconBroadcastOff } from "@tabler/icons-react";
import { useWsjtx } from "@/contexts/WsjtxContext";

//WSJT-X connection indicator. Desktop only
export const WsjtxStatus = () => {
    const { available, connected } = useWsjtx();

    if (!available) return null;

    const Icon = connected ? IconBroadcast : IconBroadcastOff;
    const color = connected ? "green" : "red";
    const label = connected ? "WSJT-X connected" : "WSJT-X not connected";

    return (
        <Tooltip label={label}>
            <Icon
                size={28}
                color={`var(--mantine-color-${color}-6)`}
                aria-label={label}
            />
        </Tooltip>
    );
};
