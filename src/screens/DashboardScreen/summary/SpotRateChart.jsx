import { useSpotData } from "@/context/SpotDataContext";
import { SignalColor } from "@/enums/SignalColors";
import { UnitType } from "@/enums/UnitType";
import { useSpotIntervalData } from "@/screens/DashboardScreen/summary/useSpotIntervalData";
import { kilometersToMiles } from "@/utils/geo";

import { AreaChart } from "@mantine/charts";
import { Box, Group, Stack, Text, useComputedColorScheme } from "@mantine/core";

const HEIGHT = 54; // height of the plot area in px
const PAD = 3; // room above the plot so the top gridline isn't clipped
const X_AXIS = 16; // height of the x axis label row
const AXIS_WIDTH = 22;
const SIDE_PAD = 4; // keeps the first and last points off the edge, in px
const COLOR = "var(--mantine-color-blue-filled)"; // adapts to light and dark
const HEADROOM = 1.1; // 10% padding above the busiest minute
const MIN_SCALE = 6; // smallest top-of-scale (multiple of 3 so ticks are whole numbers)

// Axis text. Passing our own `tick` replaces Mantine's default, which carries the
// theme-aware color, so the color has to be set here or it stays gray in dark mode.
const TICK = { fontSize: 10, fill: "var(--mantine-color-dimmed)" };

const UNIT_LABEL = {
    [UnitType.METRIC]: "km",
    [UnitType.IMPERIAL]: "mi",
};

const fmtSnr = (snr) => `${Math.round(snr)} dB`;

// hollow dot for a minute with no spots (6px across, same as the distance chart)
const renderDot = ({ cx, cy, index, payload }) =>
    payload.spots === 0 ? (
        <circle
            key={index}
            cx={cx}
            cy={cy}
            r={2.25}
            fill="var(--mantine-color-body)"
            stroke="var(--mantine-color-gray-5)"
            strokeWidth={1.5}
        />
    ) : null;

export const SpotRateChart = ({ unitType = UnitType.METRIC }) => {
    const { filteredSpots } = useSpotData();
    const intervals = useSpotIntervalData(filteredSpots);

    // Same colors as Mantine's own <Tooltip> (dark in light mode, light in dark mode),
    // so this tooltip matches the one on the distance chart.
    const isDark = useComputedColorScheme("light") === "dark";
    const tipBg = isDark
        ? "var(--mantine-color-gray-2)"
        : "var(--mantine-color-gray-9)";
    const tipColor = isDark
        ? "var(--mantine-color-black)"
        : "var(--mantine-color-white)";

    // keep the distance and SNR stats on each point so the tooltip can show them
    const data = intervals.map((d, i) => ({
        minute: i,
        spots: d ? d.count : 0,
        maxKm: d?.maxKm,
        medKm: d?.medKm,
        avgSnr: d?.avgSnr,
    }));
    const n = data.length;

    // Top of the scale: the busiest minute plus headroom, rounded up to a multiple
    // of 3 so the evenly spaced ticks are whole numbers.
    const peak = Math.ceil(Math.max(0, ...data.map((d) => d.spots)) * HEADROOM);
    const maxY = Math.max(MIN_SCALE, Math.ceil(peak / 3) * 3);
    const ticks = [0, maxY / 3, (maxY * 2) / 3, maxY];

    const toUnit = (km) =>
        unitType === UnitType.IMPERIAL ? kilometersToMiles(km) : km;
    const fmtDist = (km) =>
        `${Math.round(toUnit(km)).toLocaleString()} ${UNIT_LABEL[unitType]}`;

    const whenLabel = (i) =>
        i === n - 1 ? "this minute" : `${n - 1 - i} min ago`;

    return (
        <Group gap="sm" wrap="wrap" align="center">
            <Box style={{ flex: "1 1 160px", minWidth: 0 }}>
                <AreaChart
                    h={PAD + HEIGHT + X_AXIS}
                    areaChartProps={{
                        margin: { top: PAD, right: 0, bottom: 0, left: 0 },
                    }}
                    data={data}
                    dataKey="minute"
                    series={[{ name: "spots", color: COLOR }]}
                    curveType="linear"
                    strokeWidth={1.5}
                    fillOpacity={0.12}
                    withGradient={false}
                    tickLine="none"
                    gridAxis="x"
                    strokeDasharray="0"
                    withDots={false}
                    areaProps={{ dot: renderDot }}
                    yAxisProps={{
                        domain: [0, maxY],
                        ticks,
                        interval: 0,
                        width: AXIS_WIDTH,
                        tick: TICK,
                    }}
                    xAxisProps={{
                        ticks: [0, n - 1],
                        interval: 0,
                        height: X_AXIS,
                        tickMargin: 4,
                        tickFormatter: (i) => (i === 0 ? "−30 min" : "now"),
                        padding: { left: SIDE_PAD, right: SIDE_PAD },
                        tick: TICK,
                    }}
                    tooltipProps={{
                        cursor: false,
                        content: ({ payload }) => {
                            const d = payload?.[0]?.payload;
                            if (!d) return null;
                            return (
                                <Box
                                    px="xs"
                                    py={5}
                                    style={{
                                        background: tipBg,
                                        color: tipColor,
                                        borderRadius:
                                            "var(--mantine-radius-sm)",
                                        fontVariantNumeric: "tabular-nums",
                                    }}
                                >
                                    <Stack gap={0}>
                                        <Text size="xs" fw={600} c="inherit">
                                            {whenLabel(d.minute)} · {d.spots}{" "}
                                            {d.spots === 1 ? "spot" : "spots"}
                                        </Text>
                                        {d.spots > 0 && (
                                            <>
                                                <Text size="xs" c="inherit">
                                                    Furthest {fmtDist(d.maxKm)}
                                                </Text>
                                                <Text size="xs" c="inherit">
                                                    Median {fmtDist(d.medKm)}
                                                </Text>
                                                <Group gap={6} wrap="nowrap">
                                                    <Box
                                                        w={8}
                                                        h={8}
                                                        bg={SignalColor.getColorForSNR(
                                                            d.avgSnr,
                                                        )}
                                                        style={{
                                                            borderRadius: "50%",
                                                        }}
                                                    />
                                                    <Text size="xs" c="inherit">
                                                        Average{" "}
                                                        {fmtSnr(d.avgSnr)}
                                                    </Text>
                                                </Group>
                                            </>
                                        )}
                                    </Stack>
                                </Box>
                            );
                        },
                    }}
                />
            </Box>
        </Group>
    );
};
