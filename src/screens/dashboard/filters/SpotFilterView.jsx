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
    Collapse,
    Badge,
} from "@mantine/core";
import { useState } from "react";
import { SpotFilter } from "../../../models/SpotFilter";
import { useSpotData } from "../../../contexts/SpotDataContext";
import { Band } from "../../../enums/Band";
import { ALL_CASES } from "../../../consts";
import { Mode } from "../../../enums/Mode";
import { useSettings } from "../../../contexts/SettingsContext";
import { UnitType } from "../../../enums/UnitType";
import { useDisclosure } from "@mantine/hooks";
import {
    IconFilter2,
    IconFilter2Search,
    IconListSearch,
} from "@tabler/icons-react";

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

    return (
        <Paper withBorder>
            <Group align="flex-end" gap="xl">
                <Group gap="xs" mih={30}>
                    <IconFilter2 size={18} />
                    <Text size="sm" fw={600}>
                        Filters
                    </Text>
                </Group>
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
                    w={140}
                    onChange={(v) => setFilter(filter.with({ band: v }))}
                    allowDeselect={false}
                />

                <Select
                    label="Mode"
                    size="xs"
                    placeholder="All"
                    data={modeValues}
                    w={140}
                    onChange={(v) => setFilter(filter.with({ mode: v }))}
                    allowDeselect={false}
                />
                <Stack gap={4} w={200}>
                    <Input.Label size="xs">Min SNR (dB)</Input.Label>
                    <Slider
                        defaultValue={-24}
                        min={-24}
                        size="xs"
                        max={10}
                        step={1}
                        onChange={(v) => setFilter(filter.with({ snr: v }))}
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
                    <Input.Label size="xs">
                        Min Distance (
                        {settings.unitType == UnitType.METRIC ? "km" : "mi"})
                    </Input.Label>
                    <Slider
                        defaultValue={0}
                        marks={distanceValues}
                        min={0}
                        size="xs"
                        max={distanceValues.at(-1).value}
                        step={100}
                        onChange={(v) =>
                            setFilter(filter.with({ distance: v }))
                        }
                        label={(v) => `${v.toLocaleString()} km`}
                        mb="md"
                    />
                </Stack>
                <Group ml="auto" gap="md">
                    <Text size="sm" c="dimmed">
                        Showing {filteredSpots.length} of {spots.length} spots
                    </Text>
                    <Button
                        variant="default"
                        size="xs"
                        onClick={() => setFilter(new SpotFilter())}
                    >
                        Reset
                    </Button>
                    {/*
                            <Button
                                variant="default"
                                size="xs"
                                onClick={toggle}
                            >
                                Hide Filters
                            </Button>
                             */}
                </Group>
            </Group>
        </Paper>
    );
};
