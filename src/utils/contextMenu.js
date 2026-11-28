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

//inputs you can type in, where the menu's paste is useful. Checkboxes,
//sliders and the like are not included
const TEXT_FIELDS = [
    "textarea",
    "input:not([type])",
    'input[type="text"]',
    'input[type="search"]',
    'input[type="number"]',
    '[contenteditable="true"]',
].join(",");

/**
 * Turns off the webview's right click menu, other than on text fields.
 * @param {EventTarget} target what to listen on, normally the window
 */
export function blockContextMenu(target) {
    target.addEventListener("contextmenu", (event) => {
        if (!event.target.closest?.(TEXT_FIELDS)) {
            event.preventDefault();
        }
    });
}
