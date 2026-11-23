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

import {
    Paper,
    Group,
    TextInput,
    Select,
    Stack,
    Slider,
    Input,
    Text,
    Button,
    Checkbox,
} from "@mantine/core";
import { SpotFilter } from "../../../models/SpotFilter";
import { useSpotData } from "../../../contexts/SpotDataContext";
import { Band } from "../../../enums/Band";
import { ALL_CASES } from "../../../consts";
import { Mode } from "../../../enums/Mode";
import { useSettings } from "../../../contexts/SettingsContext";
import { UnitType } from "../../../enums/UnitType";
import { IconFilter2 } from "@tabler/icons-react";
import { kilometersToMiles, milesToKilometers } from "@/utils/geo";
import { MIN_SNR } from "@/consts/config";

const bandValues = [ALL_CASES, ...Band.cases];
const modeValues = [ALL_CASES, ...Mode.cases];

export const SpotFilterView = () => {
    const { filter, setFilter, filteredSpots, spots } = useSpotData();
    const { settings } = useSettings();

    const distanceValues =
        settings.unitType === UnitType.METRIC
            ? [
                  { value: 0, label: "0" },
                  { value: 5000, label: "5k" },
                  { value: 10000, label: "10k" },
                  { value: 15000, label: "15k" },
                  { value: 20000, label: "20k" },
              ]
            : [
                  { value: 0, label: "0" },
                  { value: 3000, label: "3k" },
                  { value: 6000, label: "6k" },
                  { value: 9000, label: "9k" },
                  { value: 12000, label: "12k" },
              ];

    const distanceAbbreviation =
        settings.unitType == UnitType.METRIC ? "km" : "mi";

    const setDistanceFilter = (value) => {
        let v =
            settings.unitType == UnitType.METRIC
                ? value
                : milesToKilometers(value);
        setFilter(filter.with({ distance: v }));
    };

    const sliderDistance =
        settings.unitType == UnitType.METRIC
            ? filter.distance
            : Math.round(kilometersToMiles(filter.distance));

    return (
        <Paper withBorder>
            <Group align="flex-end" gap="xl" pos="relative">
                <Group gap="xs" mih={30} style={{ alignSelf: "flex-start" }}>
                    <IconFilter2 size={18} />
                    <Text size="sm" fw={600}>
                        Filters
                    </Text>
                </Group>

                <Group align="flex-start" gap="xl">
                    <TextInput
                        size="xs"
                        label="Callsign"
                        placeholder="callsign"
                        value={filter.callsign}
                        onChange={(e) =>
                            setFilter(
                                filter.with({
                                    callsign: e.currentTarget.value,
                                }),
                            )
                        }
                        w={160}
                    />

                    <Select
                        label="Band"
                        size="xs"
                        placeholder="All"
                        data={bandValues}
                        value={filter.band}
                        w={140}
                        onChange={(v) => setFilter(filter.with({ band: v }))}
                        allowDeselect={false}
                    />

                    <Select
                        label="Mode"
                        size="xs"
                        placeholder="All"
                        data={modeValues}
                        value={filter.mode}
                        w={140}
                        onChange={(v) => setFilter(filter.with({ mode: v }))}
                        allowDeselect={false}
                    />

                    <Stack gap={4} w={200}>
                        <Input.Label size="xs" w={200}>
                            Min SNR (dB)
                        </Input.Label>
                        <Slider
                            min={MIN_SNR}
                            size="xs"
                            max={10}
                            value={filter.snr}
                            step={1}
                            onChange={(v) => setFilter(filter.with({ snr: v }))}
                            marks={[
                                { value: MIN_SNR, label: `${MIN_SNR}` },
                                { value: -20, label: "-20" },
                                { value: -10, label: "-10" },
                                { value: 0, label: "0" },
                                { value: 10, label: "10" },
                            ]}
                            mb="md"
                        />
                    </Stack>
                    <Stack gap={4} w={200}>
                        <Input.Label size="xs" w={200}>
                            Min Distance ({distanceAbbreviation})
                        </Input.Label>
                        <Slider
                            marks={distanceValues}
                            value={sliderDistance}
                            min={0}
                            size="xs"
                            max={distanceValues.at(-1).value}
                            step={100}
                            onChange={(v) => setDistanceFilter(v)}
                            label={(v) =>
                                `${v.toLocaleString()} ${distanceAbbreviation}`
                            }
                            mb="md"
                        />
                    </Stack>
                    <Checkbox
                        mt={30}
                        size="xs"
                        checked={filter.skipDuplicates}
                        onChange={(e) => {
                            setFilter(
                                filter.with({
                                    skipDuplicates: e.currentTarget.checked,
                                }),
                            );
                        }}
                        label="Omit Duplicates"
                        style={{ alignSelf: "flex-end" }}
                    />
                </Group>
                <Button
                    variant="default"
                    size="xs"
                    onClick={() => setFilter(new SpotFilter())}
                    style={{ alignSelf: "flex-end" }}
                >
                    Reset
                </Button>

                <Group ml="auto" gap="md" pos="absolute" top={-8} right={-4}>
                    <Text size="sm" c="dimmed" fw={600}>
                        {filteredSpots.length} / {spots.length}
                    </Text>
                </Group>
            </Group>
        </Paper>
    );
};
