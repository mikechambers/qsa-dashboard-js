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
import { useWsjtx } from "@/contexts/WsjtxContext";
import { NotificationKind } from "@/enums/NotificationKind";

//warns that a second WSJT-X is sending and being ignored. Draws nothing itself,
//and does nothing in the web version
export const SecondWsjtxNotice = () => {
    const { ignored } = useWsjtx();
    const { notify, dismiss } = useNotifications();

    useEffect(() => {
        if (!ignored) return;

        //the sender is in the id, so another one shows again after this has
        //been closed
        const id = notify({
            id: `second-wsjtx:${ignored.sender}`,
            kind: NotificationKind.WARNING,
            title: "Ignoring a second WSJT-X",
            message: `Only one is supported. "${ignored.id}" at ${ignored.sender} is being ignored.`,
        });

        return () => dismiss(id);
    }, [ignored, notify, dismiss]);

    return null;
};
