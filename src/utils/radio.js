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

export const normalizeMaidenHeadGrid = (grid) => {
    if (typeof grid !== "string") {
        //todo: should this return string or undefined?
        return "";
    }

    let g = grid.trim().slice(0, 6).toUpperCase();

    if (g.length < 4) {
        return g;
    }

    return g.slice(0, 4) + g.slice(4).toLowerCase();
};

export const isValidMaidenHeadGrid = (grid) => {
    //ai helped with the regex
    return /^[A-Ra-r]{2}[0-9]{2}([A-Xa-x]{2})?$/.test(grid);
};

export const normalizeCallsign = (callsign) => {
    if (typeof callsign !== "string") {
        return "";
    }

    return callsign.toUpperCase().trim();
};

export const isUSCallsign = (callsign) => {
    if (typeof callsign !== "string") {
        return false;
    }

    //ai helped with the regex
    return /^(?:A[A-L]|[KNW])/i.test(callsign);
};

const PORTABLE_SUFFIXES = new Set(["P", "M", "MM", "AM", "QRP", "A", "B"]);

const isValidPlainCallsign = (callsign) => {
    if (isUSCallsign(callsign)) {
        return isValidUSCallsign(callsign);
    } else {
        return isValidGlobalCallsign(callsign);
    }
};

//accepts plain callsigns (W1AW) and portable forms with a prefix and / or
//suffix: DL/W1AW, W1AW/P, W1AW/7, DL/W1AW/P. Exactly one part must be a
//valid plain callsign. The other parts must look like a prefix or a suffix.
export const isValidCallsign = (callsign) => {
    if (typeof callsign !== "string") {
        return false;
    }

    const parts = callsign.trim().toUpperCase().split("/");

    if (parts.length > 3 || parts.some((p) => p === "")) {
        return false;
    }

    if (parts.filter(isValidPlainCallsign).length !== 1) {
        return false;
    }

    return parts.every(
        (p) =>
            isValidPlainCallsign(p) ||
            /^[0-9]$/.test(p) ||
            PORTABLE_SUFFIXES.has(p) ||
            /^[A-Z0-9]{1,4}$/.test(p),
    );
};

export const isValidUSCallsign = (callsign) => {
    //ai helped with the regex
    return /^(?:[KNW][0-9][A-Z]{2,3}|(?:A[A-L]|[KNW][A-Z])[0-9][A-Z]{1,3})$/i.test(
        callsign,
    );
};

export const isValidGlobalCallsign = (callsign) => {
    //ai helped with the regex
    return /^(?:[A-Z]{1,2}|[A-Z][0-9]|[0-9][A-Z])[0-9][A-Z]{1,3}$/i.test(
        callsign,
    );
};

//whether two grids are different places. One with more characters than the
//other is the same place if they agree as far as the shorter one goes. false if
//either isn't a grid
export const gridsDiffer = (a, b) => {
    const [first, second] = [a, b].map(normalizeMaidenHeadGrid);

    if (![first, second].every(isValidMaidenHeadGrid)) return false;

    return !first.startsWith(second) && !second.startsWith(first);
};
