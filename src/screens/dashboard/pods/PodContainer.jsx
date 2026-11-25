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

import { useMemo } from "react";
import { Divider, Group, Paper } from "@mantine/core";
import { SummaryBase } from "./PodBase";
import { useSpotData } from "@/contexts/SpotDataContext";

import { useSettings } from "@/contexts/SettingsContext";
import { ElapsedTimePod } from "./ElapsedTimePod";

import { SpotPod } from "@/screens/dashboard/pods/SpotPod";
import { DistanceSNRChartPod } from "./charts/DistanceSNRChartPod";
import { SpotRateChartPod } from "./charts/SpotRateChartPod";
import { useSpotIntervalData } from "./charts/useSpotIntervalData";
import { FurthestSpotPod } from "./FurthestSpotPod";
import { MostRecentSpotPod } from "./MostRecentSpotPod";
import { BandsPod } from "./BandsPod";
import { ALL_CASES } from "@/consts";
import { ChartContainer } from "./charts/ChartContainer";

export const PodContainer = () => {
    const {
        furthestSpot,
        uniqueStations,
        uniqueCountries,
        mostRecentSpot,
        filteredSpots,
        spots,
        filter,
        setFilter,
    } = useSpotData();
    const { settings } = useSettings();

    //the bands pod ignores the band filter, so the other bands stay visible
    //(and clickable) while one is selected
    const bandSpots = useMemo(
        () => filter.with({ band: ALL_CASES }).filter(spots),
        [filter, spots],
    );

    const uniqueStationsSubValue = `in ${uniqueCountries.length} ${uniqueCountries.length === 1 ? "country" : "countries"}`;

    return (
        <div className={classes.summary}>
            <Group gap="md">
                <Paper withBorder radius="md">
                    <Group gap={20} align="stretch">
                        <FurthestSpotPod spot={furthestSpot} />
                        <Divider orientation="vertical" />
                        <MostRecentSpotPod spot={mostRecentSpot} />
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
                {/* grows with the tiles, but no wider than they need, and
                    no narrower than 350. If there isn't room for all of them
                    the tiles scroll. */}
                <Paper
                    withBorder
                    radius="md"
                    style={{
                        flex: "1 1 350px",
                        minWidth: 350,
                        maxWidth: "max-content",
                    }}
                >
                    <BandsPod
                        spots={bandSpots}
                        unitType={settings.unitType}
                        selectedBand={
                            filter.band === ALL_CASES ? null : filter.band
                        }
                        onSelectBand={(band) =>
                            setFilter(filter.with({ band: band ?? ALL_CASES }))
                        }
                    />
                </Paper>

                <ChartContainer
                    spots={filteredSpots}
                    unitType={settings.unitType}
                />
            </Group>
        </div>
    );
};
