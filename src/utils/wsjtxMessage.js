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

//step 1: turn the text of a decoded message into its parts. No outside
//context is used here, so this is easy to test.

import { DecodeKind } from "@/enums/DecodeKind";

const GRID = /^[A-R]{2}[0-9]{2}$/;
const REPORT = /^[+-][0-9]{2}$/;
const ROGER_REPORT = /^R[+-][0-9]{2}$/;

//deliberately loose, so special event calls get through
const isCall = (token) =>
    /^[A-Z0-9/]{3,11}$/.test(token) &&
    /[A-Z]/.test(token) &&
    /[0-9]/.test(token) &&
    !GRID.test(token);

//a callsign may be wrapped in <> (sent as a hash). <...> means WSJT-X could
//not work out who it was. Returns undefined if the token isn't a callsign
const readCall = (token = "") => {
    if (token === "<...>") return { call: null };

    const call = token.replace(/^<(.+)>$/, "$1");
    return isCall(call) ? { call } : undefined;
};

//what follows the two callsigns
const readExtra = (extra) => {
    if (extra === undefined) return { kind: DecodeKind.CALL };
    if (extra === "RRR") return { kind: DecodeKind.RRR };
    //must be checked before GRID, as RR73 also looks like a grid
    if (extra === "RR73") return { kind: DecodeKind.RR73 };
    if (extra === "73") return { kind: DecodeKind.SEVENTY_THREE };
    if (GRID.test(extra)) return { kind: DecodeKind.GRID, grid: extra };
    if (REPORT.test(extra)) {
        return { kind: DecodeKind.REPORT, report: Number(extra) };
    }
    if (ROGER_REPORT.test(extra)) {
        return {
            kind: DecodeKind.ROGER_REPORT,
            report: Number(extra.slice(1)),
        };
    }
};

//returns { kind, from, to, cqModifier, grid, report }
//from is the station that transmitted
export function parseWsjtxMessage(text = "") {
    const unknown = { kind: DecodeKind.UNKNOWN };

    //WSJT-X can append decoder notes such as "a1" or "? a2"
    const tokens = text
        .trim()
        .toUpperCase()
        .replace(/\s+(\?\s*)?A[0-9]$/, "")
        .replace(/\s+\?$/, "")
        .split(/\s+/);

    if (tokens[0] === "CQ" || tokens[0] === "QRZ") {
        let rest = tokens.slice(1);
        let cqModifier;

        //CQ DX, CQ POTA, CQ NA, CQ 290 ...
        if (/^([A-Z]{1,4}|[0-9]{3})$/.test(rest[0] ?? "")) {
            cqModifier = rest[0];
            rest = rest.slice(1);
        }

        const sender = readCall(rest[0]);
        const grid = rest[1];

        if (!sender || rest.length > 2 || (grid && !GRID.test(grid))) {
            return unknown;
        }

        return { kind: DecodeKind.CQ, from: sender.call, cqModifier, grid };
    }

    if (tokens.length < 2 || tokens.length > 3) return unknown;

    const to = readCall(tokens[0]);
    const from = readCall(tokens[1]);
    const extra = readExtra(tokens[2]);

    if (!to || !from || !extra) return unknown;

    return { ...extra, to: to.call, from: from.call };
}
