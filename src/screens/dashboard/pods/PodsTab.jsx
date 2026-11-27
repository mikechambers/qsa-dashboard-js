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

import { ActionIcon } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";

import { useSettings } from "@/contexts/SettingsContext";
import { useSpotData } from "@/contexts/SpotDataContext";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Breakpoint } from "@/enums/Breakpoint";
import { Platform } from "@/enums/Platform";
import { PLATFORM } from "@/utils/platform";
import { SUMMARY_BAR_MAX_BANDS } from "@/consts/config";
import { convertAndFormatDistance } from "@/utils/view";
import { getBandNoun, getBandStats, pickBands } from "@/utils/bandStats";
import { SummaryBase } from "./PodBase";
import { WsjtxPod } from "./WsjtxPod";
import { FurthestSpotPod } from "./FurthestSpotPod";
import { FurthestHeardPod } from "./FurthestHeardPod";
import { MostRecentSpotPod } from "./MostRecentSpotPod";
import { ElapsedTimePod } from "./ElapsedTimePod";
import { getBandColorVar, useBandFilter } from "./useBandFilter";
import { useSummaryData } from "./useSummaryData";

import classes from "./PodsTab.module.css";

//click a band to filter to it, click it again to clear the filter
const Bands = ({ rows, onMore }) => {
    const { settings } = useSettings();
    const { selected, toggle } = useBandFilter();
    const bands = getBandStats(rows);
    const shown = pickBands(bands, SUMMARY_BAR_MAX_BANDS, selected);
    const hidden = bands.length - shown.length;

    return (
        <span className={classes.bands}>
            {shown.map((stat) => {
                const band = stat.band.toLowerCase();
                const furthest = convertAndFormatDistance(
                    stat.furthest,
                    settings.unitType,
                );
                const isSelected = stat.band === selected;

                return (
                    <button
                        key={stat.band}
                        type="button"
                        className={classes.band}
                        aria-pressed={isSelected}
                        style={{
                            "--band-color": getBandColorVar(stat.band),
                        }}
                        title={`${band}: ${stat.count} ${getBandNoun(stat)}, furthest ${furthest.d} ${furthest.unit}`}
                        onClick={() => toggle(stat.band)}
                    >
                        <span className={classes.dot} />
                        {band}
                        <strong>{stat.count}</strong>
                    </button>
                );
            })}
            {hidden > 0 && (
                <button
                    type="button"
                    className={classes.band}
                    title="Show all bands"
                    onClick={onMore}
                >
                    +{hidden}
                </button>
            )}
        </span>
    );
};

//shown in place of the pods when they are collapsed: the same numbers on one
//line. The arrow, or any space between the items, opens the pods
export const PodsTab = () => {
    const { setShowPods } = useSettings();
    const { mostRecentSpot } = useSpotData();
    const { bandRows, summary } = useSummaryData();
    //as for the pods, phones only get the essentials
    const compact = useBreakpoint() === Breakpoint.COMPACT;

    const open = () => setShowPods(true);

    const onClick = (e) => {
        if (!e.target.closest("button")) open();
    };

    const countries = summary.countryCount === 1 ? "country" : "countries";

    return (
        <div className={classes.bar} onClick={onClick}>
            <WsjtxPod compact />
            <FurthestSpotPod row={summary.furthest} compact />
            {/* only the desktop app hears stations */}
            {PLATFORM === Platform.DESKTOP ? (
                <FurthestHeardPod row={summary.furthestHeard} compact />
            ) : (
                <MostRecentSpotPod row={summary.mostRecent} compact />
            )}
            <SummaryBase
                label="Stations"
                value={summary.stationCount}
                compactSubvalue={`/ ${summary.countryCount} ${countries}`}
                compact
            />
            {!compact && (
                <ElapsedTimePod mostRecentSpot={mostRecentSpot} compact />
            )}
            {!compact && <Bands rows={bandRows} onMore={open} />}

            <ActionIcon
                variant="default"
                size="sm"
                aria-label="Show summary"
                title="Show summary"
                ml="auto"
                onClick={open}
            >
                <IconChevronDown size={16} />
            </ActionIcon>
        </div>
    );
};
