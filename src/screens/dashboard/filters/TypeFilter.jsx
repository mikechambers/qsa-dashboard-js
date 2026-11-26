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

import { Group, Select } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { ALL_CASES } from "@/consts";
import { useSettings } from "@/contexts/SettingsContext";
import { StationType } from "@/enums/StationType";
import { TypeIcon } from "../map/TypeIcon";

//which types to show: all of them, or just spots, heard stations or stations
//calling CQ
export const TypeFilter = () => {
    const { settings, setShowSpotMarkers, setShowHeard, setShowCQ } =
        useSettings();

    const types = [
        {
            label: "Spot",
            type: StationType.SPOT,
            on: settings.showSpotMarkers,
            set: setShowSpotMarkers,
        },
        {
            label: "Heard",
            type: StationType.HEARD,
            on: settings.showHeard,
            set: setShowHeard,
        },
        {
            label: "CQ",
            type: StationType.CQ,
            on: settings.showCQ,
            set: setShowCQ,
        },
    ];

    const choices = [ALL_CASES, ...types.map((t) => t.label)];

    const on = types.filter((t) => t.on).map((t) => t.label);
    const value =
        on.length === types.length ? ALL_CASES : on.join(", ") || "None";

    //the map symbol for a choice. All and mixes don't have one
    const getIcon = (label) => {
        const type = types.find((t) => t.label === label)?.type;
        return type && <TypeIcon type={type} size={0.65} />;
    };

    //a fixed width, so the labels line up with and without a symbol
    const renderOption = ({ option, checked }) => (
        <Group gap={6} wrap="nowrap" w="100%">
            <span style={{ display: "flex", justifyContent: "center", width: 14 }}>
                {getIcon(option.value)}
            </span>
            {option.label}
            {checked && (
                <IconCheck size={14} style={{ marginLeft: "auto" }} />
            )}
        </Group>
    );

    return (
        <Select
            label="Type"
            size="xs"
            //the map buttons can pick a mix that isn't one of the choices, so
            //add it to the list while it is selected
            data={choices.includes(value) ? choices : [...choices, value]}
            value={value}
            renderOption={renderOption}
            leftSection={getIcon(value)}
            w={120}
            onChange={(v) => {
                if (!choices.includes(v)) return;
                types.forEach((t) => t.set(v === ALL_CASES || v === t.label));
            }}
            allowDeselect={false}
        />
    );
};
