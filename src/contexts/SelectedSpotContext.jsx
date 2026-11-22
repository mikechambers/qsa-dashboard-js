import { createContext, useCallback, useContext, useState } from "react";
import { useSpotData } from "./SpotDataContext";

const SelectedSpotContext = createContext(null);

export function SelectedSpotProvider({ children }) {
    const [selectedId, setSelectedId] = useState();

    const { filteredSpots } = useSpotData();

    const selectedSpot = filteredSpots.find((s) => s.id === selectedId);

    //only need to create once
    const setSelectedSpot = useCallback((spot) => setSelectedId(spot?.id), []);

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
