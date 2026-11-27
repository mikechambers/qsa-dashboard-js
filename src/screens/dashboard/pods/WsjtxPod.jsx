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

import { Box, Paper } from "@mantine/core";
import { useWsjtx } from "@/contexts/WsjtxContext";
import { Band } from "@/enums/Band";
import { SummaryBase } from "./PodBase";
import classes from "./WsjtxPod.module.css";

//the bar for what the radio is doing. Nothing otherwise: WSJT-X doesn't say
//whether Monitor is on, so we don't know that it is receiving
const getRadioState = (status) => {
    if (status?.transmitting)
        return { label: "Transmitting", className: classes.tx };
    if (status?.decoding)
        return { label: "Decoding", className: classes.decode };
};

//the band and mode WSJT-X is on, and whether it is decoding or
//transmitting. Desktop only
export const WsjtxPod = () => {
    const { available, status } = useWsjtx();

    if (!available) return null;

    const radio = [
        status && Band.fromFrequency(status.dialFrequency)?.toLowerCase(),
        status?.mode,
    ]
        .filter(Boolean)
        .join(" · ");

    const state = getRadioState(status);

    return (
        <Paper withBorder radius="md">
            <Box miw={{ base: 120, sm: 150 }}>
                <SummaryBase
                    label="WSJT-X"
                    value={radio || undefined}
                    //the space is kept when there is no bar, so the pod
                    //doesn't change size
                    footer={
                        <div
                            className={`${classes.bar} ${state?.className ?? ""}`}
                        >
                            {state?.label}
                        </div>
                    }
                />
            </Box>
        </Paper>
    );
};
