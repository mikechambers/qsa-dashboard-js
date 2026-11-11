import { createContext, useContext } from "react";
import { useLocalStorage } from '@mantine/hooks';



const SettingsContext = createContext(null);

export function SettingsProvider({children}) {

    //todo: should namespace this? or save as a json obj
    const [callsign, setCallsign] = useLocalStorage({
        key:"callsign",
        defaultValue:"",
        getInitialValueInEffect: false
    });

    const [grid, setGrid] = useLocalStorage({
        key:"grid",
        defaultValue:"",
        getInitialValueInEffect: false
    });

    const settings = {
        grid, callsign
    }

    return (
        <SettingsContext.Provider value={{settings, setCallsign, setGrid}}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    return useContext(SettingsContext)
}