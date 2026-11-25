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

import { ABOUT_PATH, SETTINGS_PATH } from "@/consts/config";
import { Button, ButtonGroup } from "@mantine/core";
import { useFullscreenDocument } from "@mantine/hooks";
import {
    IconArrowsMaximize,
    IconArrowsMinimize,
    IconAdjustmentsHorizontal,
    IconInfoCircle,
} from "@tabler/icons-react";
import { useNavigate } from "react-router";

export const ControlContainer = ({ compact = false }) => {
    const { toggle, fullscreen } = useFullscreenDocument();
    const navigate = useNavigate();

    return (
        <ButtonGroup>
            <Button
                variant="default"
                title="Open Settings"
                //the default padding squeezes an icon on its own
                px={compact ? "xs" : undefined}
                onClick={() => navigate(SETTINGS_PATH)}
                leftSection={
                    !compact && <IconAdjustmentsHorizontal size={16} />
                }
            >
                {compact ? <IconAdjustmentsHorizontal size={16} /> : "Settings"}
            </Button>

            <Button
                variant="default"
                title="About"
                //the default padding squeezes an icon on its own
                px={compact ? "xs" : undefined}
                onClick={() => navigate(ABOUT_PATH)}
                leftSection={!compact && <IconInfoCircle size={16} />}
            >
                {compact ? <IconInfoCircle size={16} /> : "About"}
            </Button>
            <Button
                variant="default"
                onClick={toggle}
                px="xs"
                aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
                {fullscreen ? (
                    <IconArrowsMinimize size={18} />
                ) : (
                    <IconArrowsMaximize size={18} />
                )}
            </Button>
        </ButtonGroup>
    );
};
