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
import { parseWsjtxMessage } from "@/utils/wsjtxMessage";
import { DecodeKind } from "@/enums/DecodeKind";

describe("parseWsjtxMessage", () => {
    it.each([
        ["CQ K1ABC FN42", { kind: "CQ", from: "K1ABC", grid: "FN42" }],
        ["CQ K1ABC", { kind: "CQ", from: "K1ABC" }],
        ["CQ DX K1ABC FN42", { kind: "CQ", from: "K1ABC", cqModifier: "DX" }],
        ["CQ POTA K1ABC", { kind: "CQ", from: "K1ABC", cqModifier: "POTA" }],
        ["CQ 290 K1ABC FN42", { kind: "CQ", cqModifier: "290" }],
        ["CQ KH6/W1AW", { kind: "CQ", from: "KH6/W1AW" }],
        ["CQ 3DA0RU", { kind: "CQ", from: "3DA0RU" }],
        ["CQ K1ABC FN42  a1", { kind: "CQ", grid: "FN42" }],
        ["W6MSH K1ABC FN42", { kind: "GRID", to: "W6MSH", from: "K1ABC" }],
        ["W6MSH K1ABC -12", { kind: "REPORT", report: -12 }],
        ["W6MSH K1ABC R+03", { kind: "ROGER_REPORT", report: 3 }],
        ["W6MSH K1ABC RRR", { kind: "RRR" }],
        ["W6MSH K1ABC RR73", { kind: "RR73" }],
        ["W6MSH K1ABC 73", { kind: "73" }],
        ["<PJ4/K1ABC> W9XYZ", { kind: "CALL", to: "PJ4/K1ABC" }],
        ["<...> K1ABC -05", { kind: "REPORT", to: null, from: "K1ABC" }],
    ])("parses %s", (text, expected) => {
        expect(parseWsjtxMessage(text)).toMatchObject(expected);
    });

    it("does not treat RR73 as a grid", () => {
        expect(parseWsjtxMessage("W6MSH K1ABC RR73").grid).toBeUndefined();
    });

    it.each([
        "",
        "TNX BOB 73 GL",
        "K1ABC W9XYZ R 579 MA",
        "K1ABC RR73; W9XYZ <KH1/KH7Z> -08",
        "CQ DX",
        "HELLO WORLD",
    ])("gives up on %s", (text) => {
        expect(parseWsjtxMessage(text).kind).toBe(DecodeKind.UNKNOWN);
    });
});
