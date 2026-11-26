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
import { getReplyState } from "../replyState";

const call = "F5RXL";
const idle = { txEnabled: false, transmitting: false, dxCall: "" };
const state = (status, attempt) => getReplyState({ call, status, attempt });

describe("getReplyState", () => {
    it("is enabled when WSJT-X is idle", () => {
        expect(state(idle)).toEqual({
            enabled: true,
            label: "Reply",
            reason: undefined,
        });
    });

    it("is disabled until there is a status", () => {
        expect(state(null).enabled).toBe(false);
    });

    it("shows that we are calling this station", () => {
        const status = { ...idle, txEnabled: true, dxCall: call };

        expect(state(status)).toMatchObject({
            enabled: false,
            label: "Calling F5RXL",
            reason: "Waiting on WSJT-X.",
        });
        expect(state({ ...status, transmitting: true }).reason).toBe(
            "Transmitting.",
        );
    });

    it("is disabled while working another station", () => {
        const result = state({ ...idle, txEnabled: true, dxCall: "EA2BFM" });

        expect(result.enabled).toBe(false);
        expect(result.reason).toBe("WSJT-X is working EA2BFM.");
    });

    it("is disabled while transmitting", () => {
        expect(state({ ...idle, transmitting: true }).enabled).toBe(false);
    });

    it("can't be clicked again while waiting", () => {
        expect(state(idle, { waiting: true }).enabled).toBe(false);
    });

    it("explains when nothing happened", () => {
        expect(state(idle, {}).reason).toMatch(/Accept UDP requests/);
        expect(state({ ...idle, dxCall: call }, {}).reason).toMatch(
            /Enable Tx/,
        );
        expect(state(idle, { error: "nope" }).reason).toBe(
            "Could not send: nope",
        );
        expect(state(idle, {}).enabled).toBe(true);
    });
});
