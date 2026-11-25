import { Group, Paper } from "@mantine/core";
import { DistanceSNRChartPod } from "./DistanceSNRChartPod";
import { SpotRateChartPod } from "./SpotRateChartPod";
import { useSpotIntervalData } from "./useSpotIntervalData";

export const ChartContainer = ({ spots, unitType }) => {
    const intervals = useSpotIntervalData(spots);

    return (
        <Group>
            <Paper withBorder radius="md" w={350}>
                <DistanceSNRChartPod
                    unitType={unitType}
                    intervals={intervals}
                />
            </Paper>
            <Paper withBorder radius="md" w={350}>
                <SpotRateChartPod unitType={unitType} intervals={intervals} />
            </Paper>
        </Group>
    );
};
