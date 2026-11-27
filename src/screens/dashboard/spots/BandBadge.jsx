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

import { Band } from "@/enums/Band";
import { Badge } from "@mantine/core";

//need to add custom colors within mantine
//https://mantine.dev/theming/colors/
export const getColorForBand = (band) => {
    switch (band?.toUpperCase()) {
        case Band.B2200M:
            return "red";
        case Band.B630M:
            return "red";
        case Band.B160M:
            return "orange";
        case Band.B80M:
            return "orange";
        case Band.B60M:
            return "yellow";
        case Band.B40M:
            return "yellow";
        case Band.B30M:
            return "lime";
        case Band.B20M:
            return "green";
        case Band.B17M:
            return "teal";
        case Band.B15M:
            return "cyan";
        case Band.B12M:
            return "blue";
        case Band.B10M:
            return "indigo";
        case Band.B6M:
            return "violet";
        case Band.B4M:
            return "violet";
        case Band.B2M:
            return "grape";
        case Band.B125M:
            return "grape";
        case Band.B70CM:
            return "pink";
        case Band.B33CM:
            return "pink";
        case Band.B23CM:
            return "pink";
        default:
            return "gray";
    }
};

export const BandBadge = ({ band }) => {
    return (
        <Badge
            variant="dot"
            color={getColorForBand(band)}
            radius="md"
            size="md"
            fw={600}
            tt="none"
        >
            {band.toLowerCase()}
        </Badge>
    );
};
