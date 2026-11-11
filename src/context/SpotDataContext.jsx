import { createContext, useContext } from "react";

const SpotDataContext = createContext(null);

export function SpotDataProvider({children}) {



    const spots = []

    return (
        <SpotDataContext.Provider value={{spots}}>
            {children}
        </SpotDataContext.Provider>
    )
}

export function useSpotData() {
    return useContext(SettingsContext)
}