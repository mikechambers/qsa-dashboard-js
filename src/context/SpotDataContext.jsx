import { createContext, useContext, useEffect, useRef, useState } from "react";
import mqtt from "mqtt";
import { useSettings } from "./SettingsContext";

const SpotDataContext = createContext(null);

export function SpotDataProvider({ children }) {
	const { settings } = useSettings();

	const [spots, setSpots] = useState([])

    const clientRef = useRef(null)

    //one once per page to connect
    useEffect(()=>{
		const clientId = `qsa-dashboard-${crypto.randomUUID()}`;
		const client = mqtt.connect("wss://mqtt.pskreporter.info:1886", {
			clientId: clientId,
		});

        clientRef.current = client;

        client.on("message", (topic, message) => {
			console.log("message", topic, message);
		});

        client.on("error", (err) => {
			console.error("MQTT connection error:", err);
		});

        return () => {
			client.end();
            clientRef.current = null;
		};

    }, [])

    //re-run when settings.callsign changes
	useEffect(() => {

        //todo: check for valid callsign

        const client = clientRef.current

        let callsign = settings?.callsign;
        console.log("callsign", callsign);

        if (!client || !callsign) return;

        let topic = `pskr/filter/v2/+/+/${callsign}/#`;
        const subscribe = () => {
			client.subscribe(topic, (err) => {
				if (!err) {
					console.log("subscribed");
				} else {
					console.log(err);
				}
			});
        };

        if(client.connected) {
            subscribe()
        }

        client.on("connect", subscribe)

        return () => {
            client.off("connect", subscribe);

            if(client.connected) {
                client.unsubscribe(topic)

                //reset spots
            }
        };
	}, [settings.callsign]);

	return (
		<SpotDataContext.Provider value={{ spots }}>
			{children}
		</SpotDataContext.Provider>
	);
}

export function useSpotData() {
	return useContext(SpotDataContext);
}
