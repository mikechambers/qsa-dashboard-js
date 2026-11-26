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

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Platform } from "@/enums/Platform";
import { PLATFORM } from "@/utils/platform";
import { listenToDecodes } from "@/utils/wsjtx";

//WSJT-X sends a heartbeat every 15 seconds. Allow for a couple to go missing
const TIMEOUT_MS = 40_000;
//decodes arrive in bursts, so add them to state in batches
const BATCH_MS = 500;
const DECODE_LIMIT = 500;

const WsjtxContext = createContext(null);

export function WsjtxProvider({ children }) {
    const [connected, setConnected] = useState(false);
    const [status, setStatus] = useState(null);
    const [decodes, setDecodes] = useState([]); //newest first

    const batchRef = useRef([]);
    const lastHeardRef = useRef(0);

    useEffect(() => {
        if (PLATFORM !== Platform.DESKTOP) return;

        const stopListening = listenToDecodes((message, decode) => {
            if (decode) console.log("decode", decode.text, decode);
            else console.log("wsjtx", message);

            if (message.type === "close") {
                setConnected(false);
                setStatus(null);
                return;
            }

            //any other message means WSJT-X is there
            lastHeardRef.current = Date.now();
            setConnected(true);

            if (message.type === "status") setStatus(message);
            if (decode) batchRef.current.unshift(decode);
        });

        const timer = setInterval(() => {
            if (Date.now() - lastHeardRef.current > TIMEOUT_MS) {
                setConnected(false);
                setStatus(null);
            }

            if (batchRef.current.length > 0) {
                const batch = batchRef.current;
                batchRef.current = [];
                setDecodes((prev) =>
                    [...batch, ...prev].slice(0, DECODE_LIMIT),
                );
            }
        }, BATCH_MS);

        return () => {
            clearInterval(timer);
            stopListening();
        };
    }, []);

    return (
        <WsjtxContext.Provider
            value={{
                //false in the web version, so UI can hide itself
                available: PLATFORM === Platform.DESKTOP,
                connected,
                status,
                decodes,
            }}
        >
            {children}
        </WsjtxContext.Provider>
    );
}

export function useWsjtx() {
    return useContext(WsjtxContext);
}
