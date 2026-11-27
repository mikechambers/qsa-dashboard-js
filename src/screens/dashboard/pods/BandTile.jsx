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

import { Box, Group, Text } from "@mantine/core";
import { timeAgo } from "@/utils/date";
import { getColorForBand } from "../spots/BandBadge";
import { UnitType } from "@/enums/UnitType";
import { kilometersToMiles } from "@/utils/geo";

import classes from "./BandsPod.module.css";

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

//one band in the bands pod
export const BandTile = ({
    stat,
    width,
    height,
    unitType,
    selected,
    onClick,
}) => {
    const color = `var(--mantine-color-${getColorForBand(stat.band)}-6)`;
    const snr = Math.round(stat.snrTotal / stat.count);
    const furthest = compactDistance(stat.furthest, unitType);
    //spots are their report of us, and decodes are ours of them, so there is
    //no one average for a mix of the two
    const mixed = stat.spots > 0 && stat.spots < stat.count;
    //spots are reports (a station can have several), heard and CQ rows are
    //stations, and a mix of the two is neither
    const noun = mixed ? "entries" : stat.spots ? "spots" : "stations";
    const average = mixed ? "" : ` avg ${snr} dB,`;
    const ago = timeAgo(new Date(stat.last)).replace(/ ago$/, "");

    return (
        <Box
            component="button"
            type="button"
            aria-pressed={selected}
            onClick={onClick}
            className={classes.tile}
            data-selected={selected || undefined}
            w={width}
            h={height}
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
            title={`${stat.band.toLowerCase()}: ${stat.count} ${noun}, last heard ${ago === "now" ? "now" : `${ago} ago`},${average} furthest ${furthest.text} ${furthest.unit}`}
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
                    {noun}
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
