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

const SignalColors = {
    VERY_WEAK: "VERY_WEAK",
    WEAK: "WEAK",
    FAIR: "FAIR",
    GOOD: "GOOD",
    STRONG: "STRONG",
};

const VALUES = {
    VERY_WEAK: { hex: "#ED5C48", label: "Very Weak" },
    WEAK: { hex: "#FD843E", label: "Weak" },
    FAIR: { hex: "#F5C842", label: "Fair" },
    GOOD: { hex: "#A3D94F", label: "Good" },
    STRONG: { hex: "#4CC764", label: "Strong" },
};

export const SignalColor = Object.freeze({
    ...SignalColors,

    cases: Object.values(SignalColors),

    getColor: (name) => VALUES[name].hex,
    getLabel: (name) => VALUES[name].label,

    getNameForSNR: (snr) => {
        if (snr >= 3) return SignalColor.STRONG;
        if (snr >= -4) return SignalColor.GOOD;
        if (snr >= -10) return SignalColor.FAIR;
        if (snr >= -17) return SignalColor.WEAK;
        return SignalColor.VERY_WEAK;
    },

    getColorForSNR: (snr) =>
        SignalColor.getColor(SignalColor.getNameForSNR(snr)),
});
