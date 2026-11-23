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

import { describe, it, expect } from "vitest";
import { SignalColor } from "@/enums/SignalColors";

describe("SignalColor.getNameForSNR", () => {
    it.each([
        [20, SignalColor.STRONG],
        [3, SignalColor.STRONG],
        [2.9, SignalColor.GOOD],
        [-4, SignalColor.GOOD],
        [-4.1, SignalColor.FAIR],
        [-10, SignalColor.FAIR],
        [-10.1, SignalColor.WEAK],
        [-17, SignalColor.WEAK],
        [-17.1, SignalColor.VERY_WEAK],
        [-30, SignalColor.VERY_WEAK],
    ])("SNR %s is %s", (snr, expected) => {
        expect(SignalColor.getNameForSNR(snr)).toBe(expected);
    });
});

describe("SignalColor.getColorForSNR", () => {
    it("returns the hex color for the matching class", () => {
        expect(SignalColor.getColorForSNR(5)).toBe(
            SignalColor.getColor(SignalColor.STRONG),
        );
        expect(SignalColor.getColorForSNR(-25)).toBe(
            SignalColor.getColor(SignalColor.VERY_WEAK),
        );
    });

    it("gives every class a color and a label", () => {
        for (const name of SignalColor.cases) {
            expect(SignalColor.getColor(name)).toMatch(/^#[0-9A-Fa-f]{6}$/);
            expect(SignalColor.getLabel(name)).toBeTruthy();
        }
    });
});
