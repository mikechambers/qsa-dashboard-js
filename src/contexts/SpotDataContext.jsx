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

import { DEBUG, MOCK_SPOTS } from "@/debug/";
import Spot from "../models/Spot";
import { SpotFilter } from "../models/SpotFilter";
import { SPOT_LIMIT } from "@/consts/config";

const SpotDataContext = createContext(null);

export function SpotDataProvider({ children }) {
    const [spots, setSpots] = useState(DEBUG ? MOCK_SPOTS : []);

    const [status, setStatus] = useState(
        DEBUG ? ConnectionStatus.CONNECTED : ConnectionStatus.DISCONNECTED,
    );

    const [filter, setFilter] = useState(new SpotFilter());

    const filteredSpots = useMemo(() => filter.filter(spots), [filter, spots]);

    const clientRef = useRef(null);

    const [activeCallsign, setActiveCallsign] = useState("");
    const prevCallsignRef = useRef("");

    const clearSpots = () => {
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

    const uniqueStations = useMemo(() => {
        const me = activeCallsign.toUpperCase();

        const calls = new Set();
        for (const s of filteredSpots) {
            if (s.receiverCall && s.receiverCall !== me)
                calls.add(s.receiverCall);
            if (s.senderCall && s.senderCall !== me) calls.add(s.senderCall);
        }
        return calls.size;
    }, [filteredSpots, activeCallsign]);

    const uniqueCountries = useMemo(() => {
        const calls = new Set();

        for (const s of filteredSpots) {
            const c = s.receiverDXCC?.countryCode;
            if (c) calls.add(c);
        }

        return [...calls];
    }, [filteredSpots]);

    const updateState = () => {
        if (DEBUG) return;

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

    //one once per page to connect
    useEffect(() => {
        const clientId = `qsa-dashboard-${crypto.randomUUID()}`;
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
                spot = Spot.fromData(JSON.parse(message.toString()));
            } catch (e) {
                console.error("Error parsing Spot JSON. Skipping.", e);
                return;
            }

            setSpots((prev) => {
                const next = [spot, ...prev].sort((a, b) => b.date - a.date);
                return next.length > SPOT_LIMIT
                    ? next.slice(0, SPOT_LIMIT)
                    : next;
            });
        });

        const errHandler = (err) => {
            console.error("MQTT connection error:", err);
            updateState();
        };

        client.on("error", errHandler);

        return () => {
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
            !DEBUG &&
            prevCallsignRef.current &&
            prevCallsignRef.current !== callsign
        ) {
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
                uniqueStations,
                uniqueCountries,
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
