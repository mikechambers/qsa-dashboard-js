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
import { useLocation } from "react-router";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationKind } from "@/enums/NotificationKind";
import { SETTINGS_PATH } from "@/consts/config";

//what ErrorBoundary shows in place of a screen that crashed. Draws nothing
//itself
export const CrashNotice = () => {
    const { pathname } = useLocation();
    const { notify, dismiss } = useNotifications();

    useEffect(() => {
        //no id, so that it is shown again even after being closed
        const id = notify({
            kind: NotificationKind.ERROR,
            title: "Something went wrong",
            message: "Reloading usually fixes this.",
            //no close button, as that would leave an empty page
            persistent: true,
            showReload: true,
            //a way out if it keeps happening. No use if we are already there
            showSettings: pathname !== SETTINGS_PATH,
        });

        return () => dismiss(id);
    }, [pathname, notify, dismiss]);

    return null;
};
