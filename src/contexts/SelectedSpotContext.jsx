import { createContext, useContext, useEffect, useState } from "react";
import { useSpotData } from "./SpotDataContext";

const SelectedSpotContext = createContext(null);

export function SelectedSpotProvider({ children }) {
    const [selectedSpot, setSelectedSpot] = useState();

    const { filteredSpots } = useSpotData();

    useEffect(() => {
        if (!selectedSpot) return;

        const foundSpot = filteredSpots.find((s) => s.id === selectedSpot.id);

        if (!foundSpot) {
            setSelectedSpot(undefined);
        }
    }, [filteredSpots, selectedSpot]);

    return (
        <SelectedSpotContext.Provider
            value={{
                selectedSpot,
                setSelectedSpot,
            }}
        >
            {children}
        </SelectedSpotContext.Provider>
    );
}

export function useSelectedSpot() {
    return useContext(SelectedSpotContext);
}
