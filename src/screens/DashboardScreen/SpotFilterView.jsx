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
} from "@mantine/core";
import { useState } from "react";
import { SpotFilter } from "../../models/SpotFilter";
import { useSpotData } from "../../context/SpotDataContext";
import { Band } from "../../enums/Band";
import { ALL_CASES } from "../../consts";
import { Mode } from "../../enums/Mode";

const bandValues = [ALL_CASES, ...Band.cases];
const modeValues = [ALL_CASES, ...Mode.cases];

export const SpotFilterView = () => {
    const { filter, setFilter, filteredSpots, spots } = useSpotData();

    //if we only show existing bands
    //const bandValues = [ALL_CASES, ...new Set(spots.map(({ band }) => band))];

    return (
        <div id="filter">
            <Paper withBorder p="md">
                <Group align="flex-end" gap="xl">
                    <TextInput
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
                        placeholder="All"
                        data={bandValues}
                        w={140}
                        onChange={(v) => setFilter(filter.with({ band: v }))}
                        allowDeselect={false}
                    />

                    <Select
                        label="Mode"
                        placeholder="All"
                        data={modeValues}
                        w={140}
                        onChange={(v) => setFilter(filter.with({ mode: v }))}
                        allowDeselect={false}
                    />
                    <Stack gap={4} w={200}>
                        <Input.Label>Min SNR (dB)</Input.Label>
                        <Slider
                            defaultValue={-24}
                            min={-24}
                            max={10}
                            step={1}
                            marks={[
                                { value: -24, label: "-24" },
                                { value: -10, label: "-10" },
                                { value: 0, label: "0" },
                                { value: 10, label: "10" },
                            ]}
                            mb="md"
                        />
                    </Stack>
                    <Stack gap={4} w={200}>
                        <Input.Label>Min Distance (km)</Input.Label>
                        <Slider
                            defaultValue={0}
                            marks={[
                                { value: 1000, label: "1k" },

                                { value: 5000, label: "5k" },

                                { value: 10000, label: "10k" },

                                { value: 15000, label: "15k" },

                                { value: 20000, label: "20k" },
                            ]}
                            min={0}
                            max={20000}
                            step={100}
                            label={(v) => `${v.toLocaleString()} km`}
                            mb="md"
                        />
                    </Stack>
                    <Group ml="auto" gap="md">
                        <Text size="sm" c="dimmed">
                            Showing {filteredSpots.length} of {spots.length}{" "}
                            spots
                        </Text>
                        <Button variant="default">Reset</Button>
                    </Group>
                </Group>
            </Paper>
        </div>
    );
};
