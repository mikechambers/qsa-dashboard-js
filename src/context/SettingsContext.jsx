import { createContext, useContext } from "react";
import { useLocalStorage } from '@mantine/hooks';
import { MeasurementType } from "../enums/MeasurementType";

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

    const [measurement, setMeasurement] = useLocalStorage({
        key:"measurement",
        defaultValue:MeasurementType.METRIC,
        getInitialValueInEffect: false
    });

    const settings = {
        grid, callsign, measurement
    }

    return (
        <SettingsContext.Provider value={{settings, setCallsign, setGrid, setMeasurement}}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    return useContext(SettingsContext)
}