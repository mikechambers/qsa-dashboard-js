/* MIT License
 *
 * Copyright (c) 2026 Mike Chambers
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
