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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getNow, subscribe } from "../useSecondTick";

describe("shared second tick", () => {
    beforeEach(() => vi.useFakeTimers({ now: 10_000 }));
    afterEach(() => vi.useRealTimers());

    it("ticks everything using it at the same moment", () => {
        const seen = [];
        const stopA = subscribe(() => seen.push(["a", getNow()]));
        vi.advanceTimersByTime(400);
        const stopB = subscribe(() => seen.push(["b", getNow()]));
        vi.advanceTimersByTime(600);

        expect(seen).toEqual([
            ["a", 11_000],
            ["b", 11_000],
        ]);

        stopA();
        stopB();
    });

    it("only runs while something is using it", () => {
        const stopA = subscribe(() => {});
        const stopB = subscribe(() => {});
        expect(vi.getTimerCount()).toBe(1);

        stopA();
        expect(vi.getTimerCount()).toBe(1);
        stopB();
        expect(vi.getTimerCount()).toBe(0);
    });
});
