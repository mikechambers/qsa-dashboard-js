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

import { BANDS_REFRESH_MS } from "@/consts/config";
import { useEffect, useRef, useState } from "react";
import { ActionIcon, Box, Group, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { StationType } from "@/enums/StationType";
import { useInterval } from "@mantine/hooks";
import classes from "./BandsPod.module.css";
import { BandTile } from "./BandTile";

const TILE_HEIGHT = 72;
const GAP = 6;

//one number per band: how many rows, when it was last heard, average snr,
//and the furthest distance. Most rows first, ties go to the most recently heard.
//rows are from getTableRows
const getBandStats = (rows) => {
    const stats = new Map();

    for (const row of rows) {
        if (!row.band) continue;

        let s = stats.get(row.band);
        if (!s) {
            s = {
                band: row.band,
                count: 0,
                spots: 0,
                snrTotal: 0,
                last: 0,
                furthest: 0,
            };
            stats.set(row.band, s);
        }

        s.count++;
        if (row.type === StationType.SPOT) s.spots++;
        s.snrTotal += row.snr ?? 0;
        s.last = Math.max(s.last, new Date(row.date).getTime() || 0);
        s.furthest = Math.max(s.furthest, row.distance ?? 0);
    }

    return [...stats.values()].sort(
        (a, b) => b.count - a.count || b.last - a.last,
    );
};

//a row of small tiles, one per band. Scrolls sideways when they don't all
//fit: no scrollbar, but an arrow at the edge shows there is more, and clicking
//it scrolls over.
//clicking a tile filters to that band, clicking it again clears the filter
export const BandsPod = ({
    rows,
    tileWidth,
    unitType,
    selectedBand,
    onSelectBand,
}) => {
    //times in the tiles are relative, so redraw every so often
    const [, setTick] = useState(0);
    const interval = useInterval(() => setTick((t) => t + 1), BANDS_REFRESH_MS);
    useEffect(() => {
        interval.start();
        return interval.stop;
    }, []);

    //not memoized: rows is a new array each render, as stations expire with time
    const bands = getBandStats(rows);

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

    //the pod can change size and the number of tiles changes with the rows
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
            aria-label={
                direction > 0 ? "Show more bands" : "Show earlier bands"
            }
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
                        width={tileWidth}
                        height={TILE_HEIGHT}
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
