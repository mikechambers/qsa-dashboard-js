import { Divider, Group, Paper, SimpleGrid } from "@mantine/core";
import { SummaryPodView } from "./SummaryPodView";
import { useSpotData } from "../../../context/SpotDataContext";
import { convertAndFormatDistance } from "../../../utils/view";
import { useSettings } from "../../../context/SettingsContext";
import { ElapsedTimePod } from "./ElapsedTimePod";
import { RecentContactPod } from "../RecentContactPod";
import { useSelectedSpot } from "../../../context/SelectedSpotContext";
import { FurthestSpotPod } from "@/screens/DashboardScreen/summary/FurthestSpotPod";
import { DistanceSNRChart } from "@/screens/DashboardScreen/summary/DistanceSNRChart";
import { SpotRateChart } from "@/screens/DashboardScreen/summary/SpotRateChart";
import { SummaryChartBase } from "@/screens/DashboardScreen/summary/SummaryChartBase";

export const SummaryPodsContainerView = () => {
    const { furthestSpot, uniqueStations, uniqueCountries, mostRecentSpot } =
        useSpotData();
    const { settings } = useSettings();

    const uniqueStationsSubValue = `in ${uniqueCountries.length} ${uniqueCountries.length === 1 ? "country" : "countries"}`;

    return (
        <div id="summary">
            <Group gap="md">
                <Paper withBorder radius="md">
                    <Group gap={20} align="stretch">
                        <FurthestSpotPod furthestSpot={furthestSpot} />
                        <Divider orientation="vertical" />
                        <SummaryPodView
                            label="Stations"
                            value={uniqueStations}
                            subvalue={uniqueStationsSubValue}
                        />

                        <Divider orientation="vertical" />
                        <ElapsedTimePod mostRecentSpot={mostRecentSpot} />
                    </Group>
                </Paper>
                <Paper withBorder radius="md" w={350}>
                    <DistanceSNRChart unitType={settings.unitType} />
                </Paper>
                <Paper withBorder radius="md" w={350}>
                    <SpotRateChart unitType={settings.unitType} />
                </Paper>
            </Group>
        </div>
    );
};
