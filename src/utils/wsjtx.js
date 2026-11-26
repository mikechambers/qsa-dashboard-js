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

import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Platform } from "@/enums/Platform";
import { PLATFORM } from "./platform";
import { createDecoder } from "./wsjtxDecoder";
import { gridStore } from "./gridStore";
import { loadCallsignLookup } from "./callsignLookup";

//calls onMessage with each message from WSJT-X (sent by the Rust listener).
//Returns a function that stops listening. Does nothing in the web version.
export function listenToWsjtx(onMessage) {
    if (PLATFORM !== Platform.DESKTOP) return () => {};

    //listen() is async and resolves to the function that unsubscribes
    const unlisten = listen("wsjtx", (event) => onMessage(event.payload));

    return () => {
        unlisten.then((off) => off());
    };
}

//asks WSJT-X to reply to a CQ, as if the decode was double clicked there.
//This can make the radio transmit, so only call it when the user asks
export function sendReply(decode) {
    const { id, ...fields } = decode.raw;

    return invoke("wsjtx_reply", { id, decode: fields });
}

//like listenToWsjtx, but also turns decodes into Decode objects.
//onMessage is called with (message, decode). decode is only set for decodes
export function listenToDecodes(onMessage) {
    if (PLATFORM !== Platform.DESKTOP) return () => {};

    const decoder = createDecoder({ grids: gridStore });

    //decodes arriving before this finishes won't have country info
    loadCallsignLookup()
        .then((lookup) => decoder.setCallsignLookup(lookup))
        .catch((e) => console.error("Error loading country data", e));

    return listenToWsjtx((message) =>
        onMessage(message, decoder.handle(message)),
    );
}
