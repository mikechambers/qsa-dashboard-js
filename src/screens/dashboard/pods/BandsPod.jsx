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

import { useEffect, useMemo, useRef, useState } from "react";
import { ActionIcon, Box, Group, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useInterval } from "@mantine/hooks";

import { UnitType } from "@/enums/UnitType";
import { kilometersToMiles } from "@/utils/geo";
import { timeAgo } from "@/utils/date";
import { getColorForBand } from "../spots/BandBadge";

import classes from "./BandsPod.module.css";

const TILE_WIDTH = 92;
const TILE_HEIGHT = 72;
const GAP = 6;

//one number per band: how many spots, when it was last heard, average snr,
//and the furthest distance. Most spots first, ties go to the most recently heard.
const getBandStats = (spots) => {
    const stats = new Map();

    for (const spot of spots) {
        if (!spot.band) continue;

        let s = stats.get(spot.band);
        if (!s) {
            s = { band: spot.band, count: 0, snrTotal: 0, last: 0, furthest: 0 };
            stats.set(spot.band, s);
        }

        s.count++;
        s.snrTotal += spot.snr ?? 0;
        s.last = Math.max(s.last, new Date(spot.date).getTime() || 0);
        s.furthest = Math.max(s.furthest, spot.distance ?? 0);
    }

    return [...stats.values()].sort((a, b) => b.count - a.count || b.last - a.last);
};

//1234 spots becomes 1.2k
const compactCount = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`);

//12,649 km becomes 12.6k
const compactDistance = (km, unitType) => {
    const miles = unitType === UnitType.IMPERIAL;
    const v = miles ? kilometersToMiles(km) : km;

    return {
        text: v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${Math.round(v)}`,
        unit: miles ? "mi" : "km",
    };
};

const BandTile = ({ stat, unitType, selected, onClick }) => {
    const color = `var(--mantine-color-${getColorForBand(stat.band)}-6)`;
    const snr = Math.round(stat.snrTotal / stat.count);
    const furthest = compactDistance(stat.furthest, unitType);
    const ago = timeAgo(new Date(stat.last)).replace(/ ago$/, "");

    return (
        <Box
            component="button"
            type="button"
            aria-pressed={selected}
            onClick={onClick}
            className={classes.tile}
            data-selected={selected || undefined}
            w={TILE_WIDTH}
            h={TILE_HEIGHT}
            px={6}
            py={5}
            style={{
                flex: "none",
                boxSizing: "border-box",
                textAlign: "left",
                font: "inherit",
                color: "inherit",
                cursor: "pointer",
                "--band-color": color,
                lineHeight: 1.15,
            }}
            title={`${stat.band.toLowerCase()}: ${stat.count} spots, last heard ${ago === "now" ? "now" : `${ago} ago`}, avg ${snr} dB, furthest ${furthest.text} ${furthest.unit}`}
        >
            <Group gap={4} wrap="nowrap">
                <Box
                    w={6}
                    h={6}
                    style={{
                        flex: "none",
                        borderRadius: "50%",
                        background: color,
                    }}
                />
                <Text fz={12} fw={600} lh={1.15}>
                    {stat.band.toLowerCase()}
                </Text>
            </Group>
            {/* the count is the main thing in the tile */}
            <Group gap={4} wrap="nowrap" align="baseline" mt={2}>
                <Text fz={26} fw={700} lh={1}>
                    {compactCount(stat.count)}
                </Text>
                <Text fz={10} c="dimmed">
                    spots
                </Text>
            </Group>
            <Text
                fz={11}
                c="dimmed"
                lh={1.2}
                mt={2}
                style={{ whiteSpace: "nowrap" }}
            >
                {furthest.text} {furthest.unit}
            </Text>
        </Box>
    );
};

//a row of small tiles, one per band. Scrolls sideways when they don't all
//fit: no scrollbar, but an arrow at the edge shows there is more, and clicking
//it scrolls over.
//clicking a tile filters to that band, clicking it again clears the filter
export const BandsPod = ({ spots, unitType, selectedBand, onSelectBand }) => {
    //times in the tiles are relative, so redraw every so often
    const [, setTick] = useState(0);
    const interval = useInterval(() => setTick((t) => t + 1), 15000);
    useEffect(() => {
        interval.start();
        return interval.stop;
    }, []);

    const bands = useMemo(() => getBandStats(spots), [spots]);

    //is there more to scroll to on either side?
    const scroller = useRef(null);
    const [more, setMore] = useState({ left: false, right: false });

    const updateMore = () => {
        const el = scroller.current;
        if (!el) return;

        const left = el.scrollLeft > 1;
        const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;

        setMore((m) =>
            m.left === left && m.right === right ? m : { left, right },
        );
    };

    //the pod can change size and the number of tiles changes with the spots
    useEffect(() => {
        updateMore();

        const el = scroller.current;
        if (!el || typeof ResizeObserver === "undefined") return;

        const observer = new ResizeObserver(updateMore);
        observer.observe(el);
        return () => observer.disconnect();
    }, [bands.length]);

    const scrollBy = (direction) => {
        const el = scroller.current;
        if (!el) return;

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        el.scrollBy({
            left: direction * el.clientWidth * 0.8,
            behavior: reduceMotion ? "auto" : "smooth",
        });
    };

    const arrow = (direction) => (
        <ActionIcon
            variant="default"
            size="sm"
            radius="xl"
            aria-label={direction > 0 ? "Show more bands" : "Show earlier bands"}
            onClick={() => scrollBy(direction)}
        >
            {direction > 0 ? (
                <IconChevronRight size={14} />
            ) : (
                <IconChevronLeft size={14} />
            )}
        </ActionIcon>
    );

    return (
        <Box pos="relative">
            <Group
                ref={scroller}
                className={classes.scroller}
                gap={GAP}
                wrap="nowrap"
                h={TILE_HEIGHT}
                onScroll={updateMore}
                style={{ overflowX: "auto", overflowY: "hidden" }}
            >
                {bands.length === 0 && (
                    <Text size="sm" c="dimmed" mx="auto">
                        No bands yet
                    </Text>
                )}

                {bands.map((stat) => (
                    <BandTile
                        key={stat.band}
                        stat={stat}
                        unitType={unitType}
                        selected={stat.band === selectedBand}
                        onClick={() =>
                            onSelectBand(
                                stat.band === selectedBand ? null : stat.band,
                            )
                        }
                    />
                ))}
            </Group>

            {more.left && (
                <div className={`${classes.fade} ${classes.fadeLeft}`}>
                    {arrow(-1)}
                </div>
            )}
            {more.right && (
                <div className={`${classes.fade} ${classes.fadeRight}`}>
                    {arrow(1)}
                </div>
            )}
        </Box>
    );
};
