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

import { useState, useEffect, useMemo } from "react";
import { SummaryBase } from "./PodBase";
import { formatHMS } from "@/utils/view";
import { timeAgo } from "@/utils/date";
import { useInterval } from "@mantine/hooks";
import { Tooltip } from "@mantine/core";

let sessionStart = null;

const elapsedSeconds = () => {
    sessionStart ??= Date.now();
    return Math.floor((Date.now() - sessionStart) / 1000);
};

export const ElapsedTimePod = ({ mostRecentSpot }) => {
    const [seconds, setSeconds] = useState(elapsedSeconds);
    const interval = useInterval(() => setSeconds(elapsedSeconds()), 1000);

    const subvalue = mostRecentSpot
        ? `last spot ${timeAgo(mostRecentSpot.date)}`
        : "";

    useEffect(() => {
        interval.start();
        return interval.stop;
    }, []);

    const onClick = () => {
        sessionStart = Date.now();
        setSeconds(0);
    };

    const f = formatHMS(seconds);

    return (
        <Tooltip label="Click to reset" withArrow>
            <span>
                <SummaryBase
                    label="Session"
                    value={f}
                    subvalue={subvalue}
                    useMonospace={true}
                    onClick={onClick}
                />
            </span>
        </Tooltip>
    );
};
