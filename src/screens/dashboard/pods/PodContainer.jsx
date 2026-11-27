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

import { useMemo } from "react";
import { ActionIcon, Box, Divider, Group, Paper } from "@mantine/core";
import { IconChevronUp } from "@tabler/icons-react";
import { SummaryBase } from "./PodBase";
import { useSpotData } from "@/contexts/SpotDataContext";

import { useSettings } from "@/contexts/SettingsContext";
import { ElapsedTimePod } from "./ElapsedTimePod";

import { FurthestSpotPod } from "./FurthestSpotPod";
import { FurthestHeardPod } from "./FurthestHeardPod";
import { MostRecentSpotPod } from "./MostRecentSpotPod";
import { BandsPod } from "./BandsPod";
import { WsjtxPod } from "./WsjtxPod";
import { ALL_CASES } from "@/consts";
import { ChartContainer } from "./charts/ChartContainer";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Breakpoint } from "@/enums/Breakpoint";
import { Platform } from "@/enums/Platform";
import { PLATFORM } from "@/utils/platform";
import { useActiveStations } from "@/hooks/useActiveStations";
import { useFilteredStations } from "@/hooks/useStations";
import { useTypeFilter } from "@/hooks/useTypeFilter";
import { StationType } from "@/enums/StationType";
import { getTableRows } from "@/utils/tableRows";
import { getSummary } from "@/utils/summary";

//width of a band tile. The wide one has room for "stations" after the count,
//and is used on desktop so the tiles don't resize as the type filter changes
const TILE_WIDTH = 92;
const WIDE_TILE_WIDTH = 106;

export const PodContainer = () => {
    const {
        mostRecentSpot,
        filteredSpots,
        ageTick,
        spots,
        filter,
        setFilter,
        activeCallsign,
    } = useSpotData();
    const { settings, setShowPods } = useSettings();
    //phones only get the essentials: no session timer, bands or charts
    const compact = useBreakpoint() === Breakpoint.COMPACT;

    //the bands pod ignores the band filter, so the other bands stay visible
    //(and clickable) while one is selected
    const bandSpots = useMemo(
        () => filter.with({ band: ALL_CASES }).filter(spots),
        [filter, spots, ageTick],
    );

    //it counts the types being viewed, the same as the table. The web version
    //only has spots
    const { available, show } = useTypeFilter();
    const stations = useFilteredStations();
    //as for spots, the bands pod ignores the band filter
    const bandStations = filter
        .with({ band: ALL_CASES })
        .filterStations(useActiveStations());
    const viewedTypes = available ? show : { [StationType.SPOT]: true };
    const bandRows = getTableRows(bandSpots, bandStations, viewedTypes);

    //the summary is of the same rows as the table
    const summary = getSummary(
        getTableRows(filteredSpots, stations, viewedTypes),
        activeCallsign,
    );

    //width the tiles need (the tile, 6px gaps, plus the Paper's padding and
    //border), capped at 350 so that with many bands they scroll instead.
    //Counts the bands of every type, so that changing the type filter doesn't
    //move the pod to another row and shift the page
    const bandCount = new Set(
        [...bandSpots, ...bandStations.map((s) => s.decode)]
            .map((item) => item.band)
            .filter(Boolean),
    ).size;
    const tileWidth = available ? WIDE_TILE_WIDTH : TILE_WIDTH;
    const bandsMinWidth = Math.min(
        Math.max(bandCount, 1) * (tileWidth + 6) + 20,
        350,
    );

    const uniqueStationsSubValue = `in ${summary.countryCount} ${summary.countryCount === 1 ? "country" : "countries"}`;

    //the collapse button is beside the pods, except on phones, where there
    //isn't the width for that and it goes under them
    return (
        <Group
            gap={compact ? 4 : "xs"}
            align={compact ? "flex-end" : "flex-start"}
            wrap="nowrap"
            style={{ flexDirection: compact ? "column" : "row" }}
        >
            <Group
                gap="md"
                style={
                    compact
                        ? { alignSelf: "stretch" }
                        : { flex: 1, minWidth: 0 }
                }
            >
                <WsjtxPod />
                <Paper withBorder radius="md">
                    <Group gap={compact ? 6 : 20} align="stretch">
                        <FurthestSpotPod row={summary.furthest} />
                        <Divider orientation="vertical" />
                        {/* only the desktop app hears stations */}
                        {PLATFORM === Platform.DESKTOP ? (
                            <FurthestHeardPod row={summary.furthestHeard} />
                        ) : (
                            <MostRecentSpotPod row={summary.mostRecent} />
                        )}
                        <Divider orientation="vertical" />
                        <SummaryBase
                            label="Stations"
                            value={summary.stationCount}
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
                        rows={bandRows}
                        tileWidth={tileWidth}
                        unitType={settings.unitType}
                        selectedBand={
                            filter.band === ALL_CASES ? null : filter.band
                        }
                        onSelectBand={(band) =>
                            setFilter(filter.with({ band: band ?? ALL_CASES }))
                        }
                    />
                </Paper>

                {/* web only, and not on phones. Not rendered at all there, since
                        a hidden chart has no size and warns about it */}
                {settings.showPods &&
                    !compact &&
                    PLATFORM !== Platform.DESKTOP && (
                        <ChartContainer
                            spots={filteredSpots}
                            unitType={settings.unitType}
                        />
                    )}
            </Group>

            <ActionIcon
                variant="default"
                size="sm"
                aria-label="Collapse summary"
                title="Collapse summary"
                onClick={() => setShowPods(false)}
            >
                <IconChevronUp size={16} />
            </ActionIcon>
        </Group>
    );
};
