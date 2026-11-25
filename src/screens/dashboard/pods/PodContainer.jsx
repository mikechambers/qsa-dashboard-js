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
import { Box, Divider, Group, Paper } from "@mantine/core";
import { SummaryBase } from "./PodBase";
import { useSpotData } from "@/contexts/SpotDataContext";

import { useSettings } from "@/contexts/SettingsContext";
import { ElapsedTimePod } from "./ElapsedTimePod";

import { FurthestSpotPod } from "./FurthestSpotPod";
import { MostRecentSpotPod } from "./MostRecentSpotPod";
import { BandsPod } from "./BandsPod";
import { ALL_CASES } from "@/consts";
import { ChartContainer } from "./charts/ChartContainer";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Breakpoint } from "@/enums/Breakpoint";

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
    //phones only get the essentials: no session timer, bands or charts
    const compact = useBreakpoint() === Breakpoint.COMPACT;

    //the bands pod ignores the band filter, so the other bands stay visible
    //(and clickable) while one is selected
    const bandSpots = useMemo(
        () => filter.with({ band: ALL_CASES }).filter(spots),
        [filter, spots],
    );

    //width the tiles need (92px each, 6px gaps, plus the Paper's padding and
    //border), capped at 350 so that with many bands they scroll instead
    const bandCount = new Set(bandSpots.map((s) => s.band).filter(Boolean))
        .size;
    const bandsMinWidth = Math.min(Math.max(bandCount, 1) * 98 + 20, 350);

    const uniqueStationsSubValue = `in ${uniqueCountries.length} ${uniqueCountries.length === 1 ? "country" : "countries"}`;

    return (
        <div className={classes.summary}>
            <Group gap="md">
                <Paper withBorder radius="md">
                    <Group gap={compact ? 6 : 20} align="stretch">
                        <FurthestSpotPod spot={furthestSpot} />
                        <Divider orientation="vertical" />
                        <MostRecentSpotPod spot={mostRecentSpot} />
                        <Divider orientation="vertical" />
                        <SummaryBase
                            label="Stations"
                            value={uniqueStations}
                            subvalue={uniqueStationsSubValue}
                        />

                        <Divider orientation="vertical" visibleFrom="sm" />
                        <Box visibleFrom="sm">
                            <ElapsedTimePod mostRecentSpot={mostRecentSpot} />
                        </Box>
                    </Group>
                </Paper>
                {/* grows with the tiles, but no wider than they need. If
                    there isn't room for all of them the tiles scroll. */}
                <Paper
                    withBorder
                    radius="md"
                    visibleFrom="sm"
                    style={{
                        flex: `1 1 ${bandsMinWidth}px`,
                        minWidth: bandsMinWidth,
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

                {/* not rendered at all on phones, since a hidden chart
                    has no size and warns about it */}
                {!compact && (
                    <ChartContainer
                        spots={filteredSpots}
                        unitType={settings.unitType}
                    />
                )}
            </Group>
        </div>
    );
};
