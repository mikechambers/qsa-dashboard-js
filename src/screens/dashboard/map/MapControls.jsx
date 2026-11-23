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

import { ActionIcon, Stack, Tooltip } from "@mantine/core";
import { IconCircleDashed, IconSunMoon } from "@tabler/icons-react";
import { useSettings } from "@/contexts/SettingsContext";

//small stack of on / off buttons for the map overlays. They flip the same
//settings as the config screen, so the two always agree.
export const MapControls = () => {
    const { settings, setShowGreyline, setShowDistanceOverlay } = useSettings();

    const toggles = [
        {
            label: "Grey line",
            icon: IconSunMoon,
            on: settings.showGreyline,
            onChange: setShowGreyline,
            //nothing to draw if every band is turned off in settings
            disabled: settings.elevationValues.length === 0,
        },
        {
            label: "Distance rings",
            icon: IconCircleDashed,
            on: settings.showDistanceOverlay,
            onChange: setShowDistanceOverlay,
            disabled: false,
        },
    ];

    return (
        <Stack gap={6} pos="absolute" left={20} top={80} style={{ zIndex: 1 }}>
            {toggles.map(({ label, icon: Icon, on, onChange, disabled }) => (
                <Tooltip key={label} label={label} position="right" withArrow>
                    <ActionIcon
                        variant="default"
                        size="lg"
                        //on = normal icon, off = just a lighter icon
                        c={on ? undefined : "gray.5"}
                        aria-label={label}
                        aria-pressed={on}
                        disabled={disabled}
                        onClick={() => onChange(!on)}
                    >
                        <Icon size={18} />
                    </ActionIcon>
                </Tooltip>
            ))}
        </Stack>
    );
};
