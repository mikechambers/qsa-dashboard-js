import { ChartTooltip } from "./ChartTooltip";
import { useSpotData } from "@/contexts/SpotDataContext";
import { SignalColor } from "@/enums/SignalColors";
import { UnitType } from "@/enums/UnitType";
import { SummaryChartBase } from "@/screens/DashboardScreen/summary/SummaryChartBase";

import { useSpotIntervalData } from "@/screens/DashboardScreen/summary/useSpotIntervalData";
import { kilometersToMiles } from "@/utils/geo";

import { BarChart } from "@mantine/charts";
import { Box, Group, Stack, Text } from "@mantine/core";

const HEIGHT = 54;
const PAD = 3;
const X_AXIS = 16;
const AXIS_WIDTH = 26;
const SIDE_PAD = 4;
const BAR_WIDTH = 5;

const UNIT_LABEL = {
    [UnitType.METRIC]: "km",
    [UnitType.IMPERIAL]: "mi",
};
const HEADROOM = 1.1;
const MIN_SCALE = 30; // smallest top-of-scale, so a near-empty chart doesnt look weird

const TICK = { fontSize: 10, fill: "var(--mantine-color-dimmed)" };

const buildScale = (furthest) => {
    const max = Math.max(furthest * HEADROOM, MIN_SCALE);
    const ticks = [0, max / 3, (max * 2) / 3, max];
    return { max, ticks };
};

const fmtSnr = (snr) => `${Math.round(snr)} dB`;
const tickLabel = (v) =>
    v >= 1000 ? `${Math.round(v / 100) / 10}k` : `${Math.round(v)}`;

export const DistanceSNRChart = ({ unitType = UnitType.METRIC }) => {
    const { filteredSpots } = useSpotData();
    const intervals = useSpotIntervalData(filteredSpots);

    const snrColor = (snr) => SignalColor.getColorForSNR(snr);

    const toUnit = (km) =>
        unitType === UnitType.IMPERIAL ? kilometersToMiles(km) : km;
    const unit = UNIT_LABEL[unitType];
    const fmtDist = (km) =>
        `${Math.round(toUnit(km)).toLocaleString()} ${unit}`;

    const data = intervals.map((d, i) => ({
        minute: i,
        count: d ? d.count : 0,
        maxKm: d?.maxKm,
        medKm: d?.medKm,
        avgSnr: d?.avgSnr,
        range: d ? [toUnit(d.medKm), toUnit(d.maxKm)] : [0, 0],
    }));
    const n = data.length;

    const maxDistance = Math.max(0, ...data.map((d) => d.maxKm ?? 0));
    const { max, ticks } = buildScale(toUnit(maxDistance));

    const whenLabel = (i) =>
        i === n - 1 ? "this minute" : `${n - 1 - i} min ago`;

    const renderBar = ({ x, y, width, height, payload }) => {
        const cx = x + width / 2;

        if (payload.count === 0) {
            return (
                <circle
                    key={payload.minute}
                    cx={cx}
                    cy={y}
                    r={2.25}
                    fill="var(--mantine-color-body)"
                    stroke="var(--mantine-color-gray-5)"
                    strokeWidth={1.5}
                />
            );
        }

        const half = BAR_WIDTH / 2;
        const top = Math.min(y, y + height);
        return (
            <rect
                key={payload.minute}
                x={cx - half}
                y={top - half}
                width={BAR_WIDTH}
                height={Math.abs(height) + BAR_WIDTH}
                rx={half}
                fill={snrColor(payload.avgSnr)}
            />
        );
    };

    return (
        <SummaryChartBase label="Max / Median Distance">
            <Box style={{ flex: "1 1 260px", minWidth: 0 }}>
                <BarChart
                    h={PAD + HEIGHT + X_AXIS}
                    barChartProps={{
                        margin: { top: PAD, right: 0, bottom: 0, left: 0 },
                    }}
                    data={data}
                    dataKey="minute"
                    series={[{ name: "range", color: "gray" }]}
                    tickLine="none"
                    gridAxis="x"
                    strokeDasharray="0"
                    barProps={{
                        isAnimationActive: true,
                        shape: renderBar,
                        barSize: BAR_WIDTH,
                    }}
                    yAxisProps={{
                        domain: [0, max],
                        ticks,
                        interval: 0,
                        width: AXIS_WIDTH,
                        tickFormatter: tickLabel,
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
                                            {whenLabel(d.minute)} · {d.count}{" "}
                                            {d.count === 1 ? "spot" : "spots"}
                                        </Text>
                                        {d.count > 0 && (
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
                />
            </Box>
        </SummaryChartBase>
    );
};
