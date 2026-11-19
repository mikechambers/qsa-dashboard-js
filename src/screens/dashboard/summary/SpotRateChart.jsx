import { useId } from "react";

import { ChartTooltip } from "./ChartTooltip";
import { useSpotData } from "@/contexts/SpotDataContext";
import { SignalColor } from "@/enums/SignalColors";
import { UnitType } from "@/enums/UnitType";
import { useSpotIntervalData } from "@/screens/dashboard/summary/useSpotIntervalData";
import { kilometersToMiles } from "@/utils/geo";

import { AreaChart } from "@mantine/charts";
import { Box, Group, Stack, Text } from "@mantine/core";
import { SummaryChartBase } from "@/screens/dashboard/summary/SummaryChartBase";

const HEIGHT = 54;
const PAD = 3;
const X_AXIS = 16;
const AXIS_WIDTH = 22;
const SIDE_PAD = 4;
const COLOR = "var(--mantine-color-blue-filled)";
const HEADROOM = 1.1; // 10% padding above the busiest minute
const MIN_SCALE = 6;
const STROKE_WIDTH = 4;

const TICK = { fontSize: 10, fill: "var(--mantine-color-dimmed)" };

const UNIT_LABEL = {
    [UnitType.METRIC]: "km",
    [UnitType.IMPERIAL]: "mi",
};

const fmtSnr = (snr) => `${Math.round(snr)} dB`;

//move to shared?
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

    const gradId = `snr-${useId().replace(/:/g, "")}`;

    const snrColor = (snr) => SignalColor.getColorForSNR(snr);

    const data = intervals.map((d, i) => ({
        minute: i,
        spots: d ? d.count : 0,
        maxKm: d?.maxKm,
        medKm: d?.medKm,
        avgSnr: d?.avgSnr,
    }));
    const n = data.length;

    // Line color one gradient stop per minute, colored by that minute's average SNR
    // (gray for minutes with no spots).
    const flat = data.every((d) => d.spots === data[0]?.spots);
    const stops = data.map((d, i) => ({
        offset: n > 1 ? i / (n - 1) : 0,
        color: d.spots > 0 ? snrColor(d.avgSnr) : "var(--mantine-color-gray-5)",
    }));

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
        <SummaryChartBase label="Spots / Minute">
            <Box style={{ flex: "1 1 160px", minWidth: 0 }}>
                <AreaChart
                    h={PAD + HEIGHT + X_AXIS}
                    areaChartProps={{
                        margin: { top: PAD, right: 0, bottom: 0, left: 0 },
                    }}
                    data={data}
                    dataKey="minute"
                    series={[{ name: "spots", color: COLOR }]}
                    curveType="natural"
                    strokeWidth={STROKE_WIDTH}
                    fillOpacity={0}
                    withGradient={false}
                    tickLine="none"
                    gridAxis="x"
                    strokeDasharray="0"
                    withDots={false}
                    areaProps={{
                        isAnimationActive: true,
                        dot: renderDot,
                        stroke: flat ? COLOR : `url(#${gradId})`,
                    }}
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
                                <ChartTooltip>
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
                                                        bg={snrColor(d.avgSnr)}
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
                                </ChartTooltip>
                            );
                        },
                    }}
                >
                    <defs>
                        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                            {stops.map((s, i) => (
                                <stop
                                    key={i}
                                    offset={`${s.offset * 100}%`}
                                    style={{ stopColor: s.color }}
                                />
                            ))}
                        </linearGradient>
                    </defs>
                </AreaChart>
            </Box>
        </SummaryChartBase>
    );
};
