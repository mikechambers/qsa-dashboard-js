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
import { configureWsjtx, listenToDecodes } from "@/utils/wsjtx";
import { useSettings } from "@/contexts/SettingsContext";
import { applyStatus } from "@/utils/wsjtxDecoder";
import {
    DECODE_LIMIT,
    HEARD_LIMIT,
    WSJTX_BATCH_MS,
    WSJTX_TIMEOUT_MS,
} from "@/consts/config";
import { mergeHeard } from "@/utils/activeStations";

const WsjtxContext = createContext(null);

//must be inside SettingsProvider
export function WsjtxProvider({ children }) {
    const { settings } = useSettings();
    const { wsjtxEnabled, wsjtxAddress, wsjtxPort } = settings;
    const desktop = PLATFORM === Platform.DESKTOP;

    const [error, setError] = useState(null); //why we aren't listening
    const [attempt, setAttempt] = useState(0); //changes to try again
    const [connected, setConnected] = useState(false);
    const [status, setStatus] = useState(null);
    const [decodes, setDecodes] = useState([]); //newest first
    //the latest decode of each station on each band, newest first. Kept after
    //WSJT-X closes
    const [heard, setHeard] = useState([]);

    const batchRef = useRef([]);
    const lastHeardRef = useRef(0);

    //(re)starts the listener whenever its settings change
    useEffect(() => {
        if (!desktop) return;

        let current = true; //false once the settings have changed again
        configureWsjtx({
            enabled: wsjtxEnabled,
            address: wsjtxAddress,
            port: wsjtxPort,
        }).catch((e) => {
            console.error("WSJT-X: could not listen", e);
            if (!current) return;
            //anything but a ListenError is a message
            setError(e?.kind ? e : { kind: "other", message: String(e) });
        });

        return () => {
            current = false;
            setError(null);
        };
    }, [desktop, wsjtxEnabled, wsjtxAddress, wsjtxPort, attempt]);

    useEffect(() => {
        if (!desktop || !wsjtxEnabled) return;

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

            if (message.type === "status") {
                setStatus(message);

                //decodes that got here before the first status have no band yet
                const apply = (d) => applyStatus(d, message);
                batchRef.current = batchRef.current.map(apply);
                setDecodes((prev) => {
                    const next = prev.map(apply);
                    //keep the same array if nothing changed, to not rerender
                    return next.some((d, i) => d !== prev[i]) ? next : prev;
                });
                setHeard((prev) => {
                    const next = prev.map(apply);
                    return next.some((d, i) => d !== prev[i])
                        ? mergeHeard(next, [], HEARD_LIMIT)
                        : prev;
                });
            }
            if (decode) batchRef.current.unshift(decode);
        });

        const timer = setInterval(() => {
            if (Date.now() - lastHeardRef.current > WSJTX_TIMEOUT_MS) {
                setConnected(false);
                setStatus(null);
            }

            if (batchRef.current.length > 0) {
                const batch = batchRef.current;
                batchRef.current = [];
                setDecodes((prev) =>
                    [...batch, ...prev].slice(0, DECODE_LIMIT),
                );
                setHeard((prev) => mergeHeard(batch, prev, HEARD_LIMIT));
            }
        }, WSJTX_BATCH_MS);

        return () => {
            clearInterval(timer);
            stopListening();

            //what we heard was from the old connection
            batchRef.current = [];
            lastHeardRef.current = 0;
            setConnected(false);
            setStatus(null);
            setDecodes([]);
            setHeard([]);
        };
    }, [desktop, wsjtxEnabled, wsjtxAddress, wsjtxPort]);

    //forget everything heard so far
    const clearDecodes = () => {
        batchRef.current = [];
        setDecodes([]);
        setHeard([]);
    };

    return (
        <WsjtxContext.Provider
            value={{
                //false in the web version or when turned off, so UI can hide
                //itself
                available: desktop && wsjtxEnabled,
                error,
                //try to listen again, after an error
                retry: () => setAttempt((n) => n + 1),
                connected,
                status,
                decodes,
                heard,
                clearDecodes,
            }}
        >
            {children}
        </WsjtxContext.Provider>
    );
}

export function useWsjtx() {
    return useContext(WsjtxContext);
}
