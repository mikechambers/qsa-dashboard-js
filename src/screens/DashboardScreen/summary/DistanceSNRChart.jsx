import { useSpotData } from "@/context/SpotDataContext";
import { SignalColor } from "@/enums/SignalColors";
import { UnitType } from "@/enums/UnitType";
import { useSpotIntervalData } from "@/screens/DashboardScreen/summary/useSpotIntervalData";
import { kilometersToMiles } from "@/utils/geo";

import { Box, Group, Stack, Text, Tooltip } from "@mantine/core";

const HEIGHT = 54;
const PAD = 3; // extra room above and below so edge bars aren't clipped
const LABEL_ROW = 12;

const UNIT_LABEL = {
    [UnitType.METRIC]: "km",
    [UnitType.IMPERIAL]: "mi",
};
const HEADROOM = 1.1; // 10% padding above the furthest spot
const MIN_SCALE = 30; // smallest top-of-scale, so a near-empty chart doesnt look weird

// Top of the axis is the furthest spot plus headroom. Ticks are spaced
// evenly from 0 to that top, so the highest gridline is the top of the plot.
const buildScale = (furthest) => {
    const max = Math.max(furthest * HEADROOM, MIN_SCALE);
    const ticks = [0, max / 3, (max * 2) / 3, max];
    return { max, ticks };
};

const AXIS_WIDTH = 26;
const BAR_WIDTH = 5;
const HIT_WIDTH = 14; // wider invisible area so thin bars are easy to hover

const fmtSnr = (snr) => `${Math.round(snr)} dB`;
const tickLabel = (v) =>
    v >= 1000 ? `${Math.round(v / 100) / 10}k` : `${Math.round(v)}`;

// Horizontal position of a minute slot, as a percentage of the plot width.
const xPct = (i, count) => 2 + (i / (count - 1)) * 96;

export const DistanceSNRChart = ({ unitType }) => {
    const { filteredSpots } = useSpotData();
    const data = useSpotIntervalData(filteredSpots);

    const toUnit = (km) =>
        unitType === UnitType.IMPERIAL ? kilometersToMiles(km) : km;

    // furthest spot in the window, in km
    const maxDistance = Math.max(
        0,
        ...data.filter(Boolean).map((d) => d.maxKm),
    );

    const unit = UNIT_LABEL[unitType];
    const { max, ticks } = buildScale(toUnit(maxDistance));

    const pct = (km) => Math.min(toUnit(km) / max, 1) * 100;
    const tickPct = (v) => Math.min(v / max, 1) * 100;
    const fmtDist = (km) =>
        `${Math.round(toUnit(km)).toLocaleString()} ${unit}`;

    const minutesAgo = (i) => data.length - 1 - i;
    const whenLabel = (i) =>
        minutesAgo(i) === 0 ? "this minute" : `${minutesAgo(i)} min ago`;

    return (
        <Group gap="sm" wrap="wrap" align="center">
            <Box style={{ flex: "1 1 260px", minWidth: 0 }}>
                <Group gap={8} wrap="nowrap" align="flex-start">
                    <Box
                        pos="relative"
                        w={AXIS_WIDTH}
                        h={HEIGHT}
                        my={PAD}
                        style={{ flex: "0 0 auto" }}
                    >
                        {ticks.map((v) => (
                            <Text
                                key={v}
                                fz={10}
                                lh={1}
                                c="dimmed"
                                ta="right"
                                pos="absolute"
                                right={0}
                                style={{
                                    bottom: `${tickPct(v)}%`,
                                    transform: "translateY(50%)",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {tickLabel(v)}
                            </Text>
                        ))}
                    </Box>

                    <Box style={{ flex: 1, minWidth: 0 }}>
                        <Box pos="relative" h={HEIGHT} my={PAD} w="100%">
                            {ticks.map((v) => (
                                <Box
                                    key={v}
                                    pos="absolute"
                                    left={0}
                                    right={0}
                                    style={{
                                        bottom: `${tickPct(v)}%`,
                                        borderTop:
                                            "1px solid var(--mantine-color-default-border)",
                                    }}
                                />
                            ))}

                            {data.map((d, i) => {
                                const left = `${xPct(i, data.length)}%`;

                                if (!d) {
                                    return (
                                        <Box
                                            key={i}
                                            pos="absolute"
                                            w={6}
                                            h={6}
                                            bd="1.5px solid var(--mantine-color-gray-5)"
                                            bg="var(--mantine-color-body)"
                                            style={{
                                                borderRadius: "50%",
                                                left,
                                                bottom: 0,
                                                transform:
                                                    "translate(-50%, 50%)",
                                            }}
                                        />
                                    );
                                }

                                // The bar runs from the median up to the furthest spot.
                                const half = BAR_WIDTH / 2;
                                const barBottom = `calc(${pct(d.medKm)}% - ${half}px)`;
                                const barHeight = `calc(${pct(d.maxKm) - pct(d.medKm)}% + ${BAR_WIDTH}px)`;

                                return (
                                    <Tooltip
                                        key={i}
                                        withArrow
                                        position="top"
                                        label={
                                            <Stack gap={0}>
                                                <Text size="xs" fw={600}>
                                                    {whenLabel(i)} · {d.count}{" "}
                                                    {d.count === 1
                                                        ? "spot"
                                                        : "spots"}
                                                </Text>
                                                <Text size="xs">
                                                    Furthest {fmtDist(d.maxKm)}
                                                </Text>
                                                <Text size="xs">
                                                    Median {fmtDist(d.medKm)}
                                                </Text>
                                                <Text size="xs">
                                                    Average {fmtSnr(d.avgSnr)}
                                                </Text>
                                            </Stack>
                                        }
                                    >
                                        {/* invisible full-height hover area, with the bar inside */}
                                        <Box
                                            pos="absolute"
                                            top={0}
                                            bottom={0}
                                            w={HIT_WIDTH}
                                            style={{
                                                left,
                                                transform: "translateX(-50%)",
                                            }}
                                        >
                                            <Box
                                                pos="absolute"
                                                w={BAR_WIDTH}
                                                bg={SignalColor.getColorForSNR(
                                                    d.avgSnr,
                                                )}
                                                style={{
                                                    borderRadius: BAR_WIDTH,
                                                    left: "50%",
                                                    transform:
                                                        "translateX(-50%)",
                                                    bottom: barBottom,
                                                    height: barHeight,
                                                }}
                                            />
                                        </Box>
                                    </Tooltip>
                                );
                            })}
                        </Box>
                        <Box pos="relative" h={LABEL_ROW}>
                            <Text
                                fz={10}
                                lh={1}
                                c="dimmed"
                                pos="absolute"
                                left={0}
                            >
                                −30 min
                            </Text>
                            <Text
                                fz={10}
                                lh={1}
                                c="dimmed"
                                pos="absolute"
                                right={0}
                            >
                                now
                            </Text>
                        </Box>
                    </Box>
                </Group>
            </Box>
        </Group>
    );
};
