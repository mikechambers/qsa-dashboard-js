import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useMemo,
} from "react";
import mqtt from "mqtt";
import { useSettings } from "./SettingsContext";
import { ConnectionStatus } from "../enums/ConnectionStatus";

import { DEBUG, MOCK_SPOTS } from "@/debug/";
import Spot from "../models/Spot";
import { SpotFilter } from "../models/SpotFilter";

const SpotDataContext = createContext(null);

export function SpotDataProvider({ children }) {
    const { settings } = useSettings();

    //const { stations, setStations } = useState(new Map());

    const [spots, setSpots] = useState(DEBUG ? MOCK_SPOTS : []);
    //const [furthestSpot, setFurthestSpot] = useState(undefined);
    const [status, setStatus] = useState(
        DEBUG ? ConnectionStatus.CONNECTED : ConnectionStatus.DISCONNECTED,
    );

    const [filter, setFilter] = useState(new SpotFilter());

    const filteredSpots = useMemo(() => filter.filter(spots), [filter, spots]);

    const clientRef = useRef(null);

    const mostRecentContact = useMemo(() => {
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
        const me = settings?.callsign?.toUpperCase();

        //sets only store unique values
        const calls = new Set();
        for (const s of filteredSpots) {
            if (s.receiverCall && s.receiverCall !== me)
                calls.add(s.receiverCall);
            if (s.senderCall && s.senderCall !== me) calls.add(s.senderCall);
        }
        return calls.size;
    }, [filteredSpots, settings?.callsign]);

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
            const spot = Spot.fromData(JSON.parse(message.toString()));
            setSpots((prev) => [...prev, spot].sort((a, b) => b.date - a.date));
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

    //re-run when settings.callsign changes
    useEffect(() => {
        //todo: check for valid callsign

        const client = clientRef.current;

        let callsign = settings?.callsign;

        if (!client || !callsign) return;

        //let topic = `pskr/filter/v2/+/+/${callsign}/#`;

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

                //reset spots
            }
        };
    }, [settings.callsign]);

    return (
        <SpotDataContext.Provider
            value={{
                spots,
                filteredSpots,
                filter,
                setFilter,
                status,
                furthestSpot,
                uniqueStations,
                mostRecentContact,
            }}
        >
            {children}
        </SpotDataContext.Provider>
    );
}

export function useSpotData() {
    return useContext(SpotDataContext);
}
