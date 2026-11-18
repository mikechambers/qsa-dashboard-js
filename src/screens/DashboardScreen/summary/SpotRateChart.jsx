import { useSpotData } from "@/context/SpotDataContext";
import { useSpotIntervalData } from "@/screens/DashboardScreen/summary/useSpotIntervalData";

import { Box, Group, Text, Tooltip } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";

const HEIGHT = 54;
const PAD = 3;
const LABEL_ROW = 12;
const AXIS_WIDTH = 22;
const SIDE_PAD = 4;
const COLOR = "var(--mantine-color-blue-filled)";
const HEADROOM = 1.1;
const MIN_SCALE = 6;

export const SpotRateChart = () => {
    const { filteredSpots } = useSpotData();
    const data = useSpotIntervalData(filteredSpots);

    const counts = data.map((d) => (d ? d.count : 0));
    const n = counts.length;

    const peak = Math.ceil(Math.max(0, ...counts) * HEADROOM);
    const maxY = Math.max(MIN_SCALE, Math.ceil(peak / 3) * 3);
    const ticks = [0, maxY / 3, (maxY * 2) / 3, maxY];
    console.log({ counts, maxY, ticks });

    const { ref, width } = useElementSize();
    const innerWidth = Math.max(width - SIDE_PAD * 2, 0);
    const step = n > 1 ? innerWidth / (n - 1) : 0;
    const x = (i) => SIDE_PAD + i * step;
    const y = (count) => HEIGHT - (count / maxY) * HEIGHT;

    const points = counts.map((c, i) => [x(i), y(c)]);
    const line = points
        .map(
            ([px, py], i) =>
                `${i === 0 ? "M" : "L"}${px.toFixed(1)} ${py.toFixed(1)}`,
        )
        .join(" ");
    const area =
        points.length > 1
            ? `${line} L${points[n - 1][0].toFixed(1)} ${HEIGHT} L${points[0][0].toFixed(1)} ${HEIGHT} Z`
            : "";

    const whenLabel = (i) => (i === n - 1 ? "last minute" : `${n - i} min ago`);

    return (
        <Group gap="sm" wrap="wrap" align="center">
            <Box style={{ flex: "1 1 160px", minWidth: 0 }}>
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
                                    bottom: `${(v / maxY) * 100}%`,
                                    transform: "translateY(50%)",
                                }}
                            >
                                {v}
                            </Text>
                        ))}
                    </Box>

                    <Box style={{ flex: 1, minWidth: 0 }}>
                        <Box
                            ref={ref}
                            pos="relative"
                            h={HEIGHT}
                            my={PAD}
                            w="100%"
                        >
                            {ticks.map((v) => (
                                <Box
                                    key={v}
                                    pos="absolute"
                                    left={0}
                                    right={0}
                                    style={{
                                        bottom: `${(v / maxY) * 100}%`,
                                        borderTop:
                                            "1px solid var(--mantine-color-default-border)",
                                    }}
                                />
                            ))}

                            {width > 0 && n > 1 && (
                                <svg
                                    width={width}
                                    height={HEIGHT}
                                    style={{
                                        position: "absolute",
                                        left: 0,
                                        top: 0,
                                        overflow: "visible",
                                    }}
                                    role="img"
                                    aria-label="Spots per minute over the last 30 minutes"
                                >
                                    <path
                                        d={area}
                                        fill={COLOR}
                                        opacity={0.12}
                                    />
                                    <path
                                        d={line}
                                        fill="none"
                                        stroke={COLOR}
                                        strokeWidth={1.5}
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                    />
                                    {points.map(([px, py], i) =>
                                        counts[i] === 0 ? (
                                            <circle
                                                key={i}
                                                cx={px}
                                                cy={py}
                                                r={2.25}
                                                fill="var(--mantine-color-body)"
                                                stroke="var(--mantine-color-gray-5)"
                                                strokeWidth={1.5}
                                            />
                                        ) : (
                                            ""
                                        ),
                                    )}
                                </svg>
                            )}

                            {width > 0 &&
                                n > 1 &&
                                counts.map((c, i) => (
                                    <Tooltip
                                        key={i}
                                        withArrow
                                        position="top"
                                        label={`${c} ${c === 1 ? "spot" : "spots"} · ${whenLabel(i)}`}
                                    >
                                        <Box
                                            pos="absolute"
                                            top={0}
                                            bottom={0}
                                            w={Math.max(step, 6)}
                                            style={{
                                                left: x(i),
                                                transform: "translateX(-50%)",
                                            }}
                                        />
                                    </Tooltip>
                                ))}
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
