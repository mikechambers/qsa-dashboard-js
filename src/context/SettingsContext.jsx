import { createContext, useContext } from "react";
import { useLocalStorage } from '@mantine/hooks';
import { UnitType } from "../enums/UnitType";

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

    const [unitType, setUnitType] = useLocalStorage({
        key:"unitType",
        defaultValue:UnitType.METRIC,
        getInitialValueInEffect: false
    });

    const settings = {
        grid, callsign, unitType
    }

    return (
        <SettingsContext.Provider value={{settings, setCallsign, setGrid, setUnitType}}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    return useContext(SettingsContext)
}