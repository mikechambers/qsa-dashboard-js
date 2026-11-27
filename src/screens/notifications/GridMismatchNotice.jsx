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

import { useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useSettings } from "@/contexts/SettingsContext";
import { useWsjtx } from "@/contexts/WsjtxContext";
import { NotificationKind } from "@/enums/NotificationKind";
import { gridsDiffer, normalizeMaidenHeadGrid } from "@/utils/radio";

//warns when WSJT-X is set to a different grid than the app. Draws nothing
//itself, and does nothing in the web version, which has no status from WSJT-X
export const GridMismatchNotice = () => {
    const { settings } = useSettings();
    const { status } = useWsjtx();
    const { notify, dismiss } = useNotifications();

    const differ = gridsDiffer(settings.grid, status?.deGrid);
    const ours = differ ? normalizeMaidenHeadGrid(settings.grid) : "";
    const theirs = differ ? normalizeMaidenHeadGrid(status.deGrid) : "";

    useEffect(() => {
        if (!ours) return;

        //the grids are in the id, so a different mismatch shows again after
        //this one has been closed
        const id = notify({
            id: `grid-mismatch:${ours}:${theirs}`,
            kind: NotificationKind.WARNING,
            title: "Grid mismatch",
            message: `This app is using ${ours}, but WSJT-X is set to ${theirs}.`,
            showSettings: true,
        });

        return () => dismiss(id);
    }, [ours, theirs, notify, dismiss]);

    return null;
};
