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
import { useWsjtx } from "@/contexts/WsjtxContext";
import { STATION_TYPE_INFO, STATION_TYPE_LIST } from "@/enums/StationType";
import { useShownTypes } from "@/hooks/useTypeFilter";
import { TypeIcon } from "./TypeIcon";

const MapToggle = ({ label, on, onChange, children, ...props }) => (
    <Tooltip label={label} position="right" withArrow>
        <ActionIcon
            variant="default"
            size="lg"
            //on = normal icon, off = just a lighter icon
            c={on ? undefined : "gray.5"}
            aria-label={label}
            aria-pressed={on}
            onClick={() => onChange(!on)}
            {...props}
        >
            {children}
        </ActionIcon>
    </Tooltip>
);

//small stack of on / off buttons for the map. The overlays flip the same
//settings as the config screen, so the two always agree.
export const MapControls = () => {
    const { settings, setShowGreyline, setShowDistanceOverlay } = useSettings();
    const { show, setTypeShown } = useShownTypes();
    const { available } = useWsjtx();

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

    //show or hide each kind of marker. Only on desktop, as the web version
    //only has spots
    const markers = STATION_TYPE_LIST.map((type) => ({
        label: STATION_TYPE_INFO[type].description,
        icon: () => <TypeIcon type={type} />,
        on: show[type],
        onChange: (on) => setTypeShown(type, on),
    }));

    return (
        <Stack gap={6} pos="absolute" left={20} top={80} style={{ zIndex: 1 }}>
            {toggles.map(({ label, icon: Icon, on, onChange, disabled }) => (
                <MapToggle
                    key={label}
                    label={label}
                    on={on}
                    onChange={onChange}
                    disabled={disabled}
                >
                    <Icon size={18} />
                </MapToggle>
            ))}

            {available &&
                markers.map(({ label, icon: Icon, on, onChange }, i) => (
                    <MapToggle
                        key={label}
                        label={label}
                        on={on}
                        onChange={onChange}
                        //a gap sets them apart from the overlays
                        mt={i === 0 ? 8 : undefined}
                    >
                        <span
                            style={{
                                display: "flex",
                                //images can't be recolored, so fade them
                                opacity: on ? 1 : 0.3,
                            }}
                        >
                            <Icon />
                        </span>
                    </MapToggle>
                ))}
        </Stack>
    );
};
