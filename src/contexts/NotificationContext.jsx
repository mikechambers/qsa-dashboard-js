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

import { useCallback, useMemo, useRef, useState } from "react";
import { NotificationKind } from "@/enums/NotificationKind";
import { NotificationContext } from "@/hooks/useNotifications";
import { Notification } from "@/screens/notifications/Notification";
import classes from "@/screens/notifications/Notification.module.css";
import {
    addNotification,
    closeNotification,
    removeNotification,
} from "@/utils/notificationList";

//holds and draws the notifications. See useNotifications for how to show one.
//Must be inside MantineProvider and the router
export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const closedByUser = useRef(new Set());
    const count = useRef(0);

    const notify = useCallback((notification) => {
        count.current += 1;
        const id = notification.id ?? `notification-${count.current}`;

        if (!closedByUser.current.has(id)) {
            setNotifications((list) =>
                addNotification(list, {
                    kind: NotificationKind.INFO,
                    ...notification,
                    id,
                }),
            );
        }

        return id;
    }, []);

    const dismiss = useCallback((id) => {
        setNotifications((list) => closeNotification(list, id));
    }, []);

    const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <div className={classes.stack}>
                {notifications.map((n) => (
                    <Notification
                        key={n.id}
                        {...n}
                        onClose={() => {
                            closedByUser.current.add(n.id);
                            dismiss(n.id);
                        }}
                        onExpire={() => dismiss(n.id)}
                        onClosed={() =>
                            setNotifications((list) =>
                                removeNotification(list, n.id),
                            )
                        }
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
}
