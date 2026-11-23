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

import { useSettings } from "@/contexts/SettingsContext";
import { useInterval } from "@mantine/hooks";
import { formatTime } from "../../../utils/view";
import { Title, Group } from "@mantine/core";
import { getShortTimeZoneName } from "../../../utils/date";
import { useEffect, useState } from "react";

export const Clock = ({ timeMode, isSecondary }) => {
    const [now, setNow] = useState(() => new Date());
    const { settings } = useSettings();
    const interval = useInterval(() => setNow(new Date()), 1000);

    const c = timeMode == settings.timeMode ? undefined : "dimmed";

    useEffect(() => {
        interval.start();
        return interval.stop;
    }, []);

    const time = formatTime(now, timeMode, true);
    const timeZone = getShortTimeZoneName(timeMode);

    return (
        <Group c={c} justify="center" visibleFrom="sm">
            <Title order={3} ff="monospace">
                {time} {timeZone}
            </Title>
        </Group>
    );
};
