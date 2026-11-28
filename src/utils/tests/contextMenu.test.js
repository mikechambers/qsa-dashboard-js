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

import { describe, expect, it } from "vitest";
import { blockContextMenu } from "../contextMenu";

//a right click on an element that is, or isn't, inside a text field
function rightClick(isTextField) {
    const target = new EventTarget();
    blockContextMenu(target);

    const event = new Event("contextmenu", { cancelable: true });
    Object.defineProperty(event, "target", {
        value: { closest: () => (isTextField ? {} : null) },
    });
    target.dispatchEvent(event);

    return event.defaultPrevented;
}

describe("blockContextMenu", () => {
    it("blocks the menu away from text fields", () => {
        expect(rightClick(false)).toBe(true);
    });

    it("leaves the menu on text fields", () => {
        expect(rightClick(true)).toBe(false);
    });
});
