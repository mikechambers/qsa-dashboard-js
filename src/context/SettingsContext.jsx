import { createContext, useContext } from "react";
import { useLocalStorage } from "@mantine/hooks";
import { UnitType } from "../enums/UnitType";
import { TimeMode } from "../enums/TimeMode";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
    //todo: should namespace this? or save as a json obj
    const [callsign, setCallsign] = useLocalStorage({
        key: "callsign",
        defaultValue: "",
        getInitialValueInEffect: false,
    });

    const [grid, setGrid] = useLocalStorage({
        key: "grid",
        defaultValue: "",
        getInitialValueInEffect: false,
    });

    const [unitType, setUnitType] = useLocalStorage({
        key: "unitType",
        defaultValue: UnitType.METRIC,
        getInitialValueInEffect: false,
    });

    const [timeMode, setTimeMode] = useLocalStorage({
        key: "timeMode",
        defaultValue: TimeMode.UTC,
        getInitialValueInEffect: false,
    });

    const settings = {
        timeMode,
        grid,
        callsign,
        unitType,
    };

    return (
        <SettingsContext.Provider
            value={{ settings, setCallsign, setGrid, setUnitType, setTimeMode }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    return useContext(SettingsContext);
}
