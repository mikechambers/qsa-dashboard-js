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

//one clock shared by whatever needs to show an age, so that they all change at
//the same moment. It only runs while something is using it

import { useSyncExternalStore } from "react";
import { SECOND_TICK_MS } from "@/consts/config";

const listeners = new Set();
let timer;
let now;

export function subscribe(listener) {
    if (!listeners.size) {
        now = Date.now();
        timer = setInterval(() => {
            now = Date.now();
            listeners.forEach((l) => l());
        }, SECOND_TICK_MS);
    }
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
        if (!listeners.size) clearInterval(timer);
    };
}

//the time of the last tick. While stopped, the current time to the second, as
//React needs the same answer when it asks twice in a row
export const getNow = () =>
    listeners.size ? now : Math.floor(Date.now() / 1000) * 1000;

//the current time in ms, rerendering the caller on each tick
export const useSecondTick = () => useSyncExternalStore(subscribe, getNow);
