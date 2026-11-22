import classes from "../DashboardScreen.module.css";

import { Divider, Group, Paper } from "@mantine/core";
import { SummaryBase } from "./PodBase";
import { useSpotData } from "@/contexts/SpotDataContext";

import { useSettings } from "@/contexts/SettingsContext";
import { ElapsedTimePod } from "./ElapsedTimePod";

import { FurthestSpotPod } from "@/screens/dashboard/pods/FurthestSpotPod";
import { DistanceSNRChartPod } from "./charts/DistanceSNRChartPod";
import { SpotRateChartPod } from "./charts/SpotRateChartPod";
import { useSpotIntervalData } from "./charts/useSpotIntervalData";

export const PodContainer = () => {
    const {
        furthestSpot,
        uniqueStations,
        uniqueCountries,
        mostRecentSpot,
        filteredSpots,
    } = useSpotData();
    const { settings } = useSettings();

    const intervals = useSpotIntervalData(filteredSpots);

    const uniqueStationsSubValue = `in ${uniqueCountries.length} ${uniqueCountries.length === 1 ? "country" : "countries"}`;

    return (
        <div className={classes.summary}>
            <Group gap="md">
                <Paper withBorder radius="md">
                    <Group gap={20} align="stretch">
                        <FurthestSpotPod furthestSpot={furthestSpot} />
                        <Divider orientation="vertical" />
                        <SummaryBase
                            label="Stations"
                            value={uniqueStations}
                            subvalue={uniqueStationsSubValue}
                        />

                        <Divider orientation="vertical" />
                        <ElapsedTimePod mostRecentSpot={mostRecentSpot} />
                    </Group>
                </Paper>
                <Paper withBorder radius="md" w={350}>
                    <DistanceSNRChartPod
                        unitType={settings.unitType}
                        intervals={intervals}
                    />
                </Paper>
                <Paper withBorder radius="md" w={350}>
                    <SpotRateChartPod
                        unitType={settings.unitType}
                        intervals={intervals}
                    />
                </Paper>
            </Group>
        </div>
    );
};
