import { createContext, useContext } from "react";
import { useLocalStorage } from "@mantine/hooks";
import { UnitType } from "../enums/UnitType";
import { TimeMode } from "../enums/TimeMode";
import { DisplayMode } from "../enums/DisplayMode";
import { ElevationValue } from "@/lib/twilight";

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

    const [displayMode, setDisplayMode] = useLocalStorage({
        key: "displayMode",
        defaultValue: DisplayMode.LIGHT,
        getInitialValueInEffect: false,
    });

    const [showGreyline, setShowGreyline] = useLocalStorage({
        key: "showGreyline",
        defaultValue: true,
        getInitialValueInEffect: false,
    });

    const [showFilters, setShowFilters] = useLocalStorage({
        key: "showFilters",
        defaultValue: true,
        getInitialValueInEffect: false,
    });

    const [elevationValues, setElevationValues] = useLocalStorage({
        key: "elevationValues",
        defaultValue: [
            ElevationValue.HORIZON,
            ElevationValue.CIVIL,
            ElevationValue.NAUTICAL,
        ],
        getInitialValueInEffect: false,
    });

    const settings = {
        timeMode,
        grid,
        callsign,
        unitType,
        displayMode,
        showGreyline,
        elevationValues,
        showFilters,
    };

    return (
        <SettingsContext.Provider
            value={{
                settings,
                setCallsign,
                setGrid,
                setUnitType,
                setTimeMode,
                setDisplayMode,
                setShowGreyline,
                setElevationValues,
                setShowFilters,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    return useContext(SettingsContext);
}
