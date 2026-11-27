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

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
    Button,
    CloseButton,
    Group,
    Paper,
    Text,
    ThemeIcon,
} from "@mantine/core";
import {
    IconAlertTriangle,
    IconCircleX,
    IconInfoCircle,
} from "@tabler/icons-react";
import { SETTINGS_PATH } from "@/consts/config";
import { NotificationKind } from "@/enums/NotificationKind";
import classes from "./Notification.module.css";

//how long info stays up
const INFO_MS = 5000;

const KIND_STYLES = {
    [NotificationKind.INFO]: { color: "blue", icon: IconInfoCircle },
    [NotificationKind.WARNING]: { color: "orange", icon: IconAlertTriangle },
    [NotificationKind.ERROR]: { color: "red", icon: IconCircleX },
};

//one notification. Shown by NotificationProvider, so use useNotifications
//rather than this
export const Notification = ({
    kind,
    title,
    message,
    showSettings,
    showReload,
    persistent, //no close button
    closing,
    onClose, //closed by the user
    onExpire, //closed itself
    onClosed, //has finished leaving the screen
}) => {
    const navigate = useNavigate();
    const { color, icon: Icon } = KIND_STYLES[kind];

    //in a ref, so a new function doesn't restart the timer
    const expireRef = useRef(onExpire);
    useEffect(() => {
        expireRef.current = onExpire;
    });

    useEffect(() => {
        if (kind !== NotificationKind.INFO) return;

        const timer = setTimeout(() => expireRef.current(), INFO_MS);
        return () => clearTimeout(timer);
    }, [kind]);

    return (
        <Paper
            withBorder
            radius="md"
            shadow="xl"
            role={kind === NotificationKind.INFO ? "status" : "alert"}
            className={`${classes.notification} ${closing ? classes.closing : ""}`}
            onAnimationEnd={() => closing && onClosed()}
        >
            {/* with Reload, the buttons can drop to a second line on a narrow
                screen */}
            <Group gap="sm" wrap={showReload ? "wrap" : "nowrap"}>
                <ThemeIcon variant="light" color={color} size={36} radius="xl">
                    <Icon size={20} />
                </ThemeIcon>
                <div
                    className={`${classes.text} ${showReload ? classes.keepWidth : ""}`}
                >
                    <Text size="sm" fw={700}>
                        {title}
                    </Text>
                    <Text size="sm" c="dimmed">
                        {message}
                    </Text>
                </div>
                {(showSettings || showReload) && (
                    <Group gap="sm" wrap="nowrap" flex="none" ml="auto">
                        {showSettings && (
                            <Button
                                variant="outline"
                                color={color}
                                size="xs"
                                onClick={() => {
                                    navigate(SETTINGS_PATH);
                                    onClose();
                                }}
                            >
                                Open Settings
                            </Button>
                        )}
                        {showReload && (
                            <Button
                                color={color}
                                size="xs"
                                onClick={() => window.location.reload()}
                            >
                                Reload
                            </Button>
                        )}
                    </Group>
                )}
                {!persistent && (
                    <CloseButton aria-label="Close" onClick={onClose} />
                )}
            </Group>
        </Paper>
    );
};
