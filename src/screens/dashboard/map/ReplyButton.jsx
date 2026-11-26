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

import { useEffect, useState } from "react";
import { Button, Stack, Text } from "@mantine/core";
import { getReplyState, REPLY_WAIT_MS } from "@/utils/replyState";
import { sendReply } from "@/utils/wsjtx";

//replies to a station's CQ. This can make the radio transmit, so it is only
//ever sent from a click. Use a key so each station starts fresh
export const ReplyButton = ({ decode, status }) => {
    const [attempt, setAttempt] = useState(); //{ waiting, error }

    useEffect(() => {
        if (!attempt?.waiting) return;

        const timer = setTimeout(
            () => setAttempt({ waiting: false }),
            REPLY_WAIT_MS,
        );
        return () => clearTimeout(timer);
    }, [attempt]);

    //once WSJT-X is calling them the attempt is over, so stopping it there
    //later doesn't show a message about this click
    if (attempt && status?.txEnabled && status.dxCall === decode.call) {
        setAttempt(undefined);
    }

    const { enabled, label, reason } = getReplyState({
        call: decode.call,
        status,
        attempt,
    });

    const reply = () => {
        setAttempt({ waiting: true });
        sendReply(decode).catch((e) => setAttempt({ error: String(e) }));
    };

    return (
        <Stack gap={4} mt={8}>
            <Button fullWidth color="grape" disabled={!enabled} onClick={reply}>
                {label}
            </Button>
            {reason && (
                <Text size="xs" c="dimmed" role="status">
                    {reason}
                </Text>
            )}
        </Stack>
    );
};
