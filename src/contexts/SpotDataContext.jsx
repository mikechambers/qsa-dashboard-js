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

import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useMemo,
} from "react";
import mqtt from "mqtt";
import { ConnectionStatus } from "../enums/ConnectionStatus";

import Spot from "../models/Spot";
import { SpotFilter } from "../models/SpotFilter";
import { SPOT_BATCH_INTERVAL, SPOT_LIMIT } from "@/consts/config";
import { useSettings } from "./SettingsContext";
import { MOCK_SPOTS } from "@/debug";
import { Mode } from "@/enums/Mode";
import { gridStore } from "@/utils/gridStore";

const SpotDataContext = createContext(null);

export function SpotDataProvider({ children }) {
    const { settings } = useSettings();

    const [spots, setSpots] = useState(settings.demoMode ? MOCK_SPOTS : []);

    const batchRef = useRef([]);

    const [status, setStatus] = useState(
        settings.demoMode
            ? ConnectionStatus.CONNECTED
            : ConnectionStatus.DISCONNECTED,
    );

    const [filter, setFilter] = useState(new SpotFilter());

    const filteredSpots = useMemo(() => filter.filter(spots), [filter, spots]);

    const clientRef = useRef(null);

    const [activeCallsign, setActiveCallsign] = useState("");
    const prevCallsignRef = useRef("");

    const clearSpots = () => {
        batchRef.current = [];
        setSpots([]);
    };

    const mostRecentSpot = useMemo(() => {
        return filteredSpots[0];
    }, [filteredSpots]);

    const furthestSpot = useMemo(() => {
        //loop through, check for larger distance on each spot, return largest
        return filteredSpots.reduce(
            (max, s) => (!max || s.distance > max.distance ? s : max),
            undefined,
        );
    }, [filteredSpots]);

    const updateState = () => {
        if (settings.demoMode) return;

        const client = clientRef.current;

        if (!client) {
            setStatus(ConnectionStatus.DISCONNECTED);
            return;
        }

        if (client.connected) {
            setStatus(ConnectionStatus.CONNECTED);
        } else if (client.reconnecting) {
            setStatus(ConnectionStatus.CONNECTING);
        } else {
            setStatus(ConnectionStatus.DISCONNECTED);
        }
    };

    //demo spots don't arrive as messages, so add their grids here. Oldest
    //first, so the newest wins
    useEffect(() => {
        if (!settings.demoMode) return;

        for (const spot of MOCK_SPOTS.toReversed()) {
            gridStore.addReported(
                spot.receiverCall,
                spot.receiverLocation?.grid,
            );
        }
    }, [settings.demoMode]);

    //one once per page to connect
    useEffect(() => {
        const clientId = `qsa-dashboard-w6msh-${crypto.randomUUID()}`;
        const client = mqtt.connect("wss://mqtt.pskreporter.info:1886", {
            clientId: clientId,
        });

        clientRef.current = client;

        client.on("connect", updateState);
        client.on("reconnect", updateState);
        client.on("offline", updateState);
        client.on("close", updateState);
        client.on("end", updateState);

        client.on("message", (topic, message) => {
            let spot;
            try {
                const json = message.toString();
                spot = Spot.fromData(JSON.parse(json));

                if (spot.mode === Mode.UNKNOWN) {
                    console.log("UNKNOWN MODE", json);
                }
            } catch (e) {
                console.error("Error parsing Spot JSON. Skipping.", e);
                return;
            }

            gridStore.addReported(
                spot.receiverCall,
                spot.receiverLocation?.grid,
            );
            batchRef.current.push(spot);
        });

        const errHandler = (err) => {
            console.error("MQTT connection error:", err);
            updateState();
        };

        client.on("error", errHandler);

        const timer = setInterval(() => {
            if (batchRef.current.length < 1) return;

            const batch = batchRef.current;
            batchRef.current = [];
            setSpots((prev) => {
                //this will fail if a date is ever null
                const next = [...batch, ...prev].sort(
                    (a, b) => b.date - a.date,
                );
                return next.length > SPOT_LIMIT
                    ? next.slice(0, SPOT_LIMIT)
                    : next;
            });
            batchRef.current = [];
        }, SPOT_BATCH_INTERVAL);

        return () => {
            clearInterval(timer);
            client.end();

            client.off("connect", updateState);
            client.off("reconnect", updateState);
            client.off("offline", updateState);
            client.off("close", updateState);
            client.off("end", updateState);
            client.off("error", errHandler);

            clientRef.current = null;
        };
    }, []);

    //re-run when the active callsign changes
    useEffect(() => {
        const client = clientRef.current;

        const callsign = activeCallsign;

        if (!client || !callsign) return;

        //switching to a different callsign: the old spots no longer apply
        if (
            !settings.demoMode &&
            prevCallsignRef.current &&
            prevCallsignRef.current !== callsign
        ) {
            batchRef.current = [];
            setSpots([]);
        }
        prevCallsignRef.current = callsign;

        //https://groups.io/g/pskr-mqtt/topic/122136550
        const c = callsign.toUpperCase().replace(/\//g, ".");
        let topic = `pskr/filter/v2/+/+/${c}/+/+/+/+/+`;
        const subscribe = () => {
            client.subscribe(topic, (err) => {
                if (!err) {
                    console.log("subscribed");
                } else {
                    console.log(err);
                }
            });
        };

        if (client.connected) {
            subscribe();
        }

        client.on("connect", subscribe);

        return () => {
            client.off("connect", subscribe);

            if (client.connected) {
                client.unsubscribe(topic);
            }
        };
    }, [activeCallsign]);

    return (
        <SpotDataContext.Provider
            value={{
                spots,
                clearSpots,
                filteredSpots,
                filter,
                setFilter,
                status,
                furthestSpot,
                mostRecentSpot,
                activeCallsign,
                setActiveCallsign,
            }}
        >
            {children}
        </SpotDataContext.Provider>
    );
}

export function useSpotData() {
    return useContext(SpotDataContext);
}
