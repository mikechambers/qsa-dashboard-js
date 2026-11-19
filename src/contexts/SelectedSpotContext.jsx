import { createContext, useContext, useState } from "react";

const SelectedSpotContext = createContext(null);

export function SelectedSpotProvider({ children }) {
    const [selectedSpot, setSelectedSpot] = useState();

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
