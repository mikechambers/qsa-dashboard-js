import { createContext, useContext } from "react";
import { useLocalStorage } from "@mantine/hooks";
import { UnitType } from "../enums/UnitType";
import { TimeMode } from "../enums/TimeMode";
import { DisplayMode } from "../enums/DisplayMode";
import { ElevationValue } from "@/lib/twilight";
import { SETTINGS_NAMESPACE } from "@/consts/config";

const SettingsContext = createContext(null);

const getSettingKey = (name) => {
    return `${SETTINGS_NAMESPACE}.${name}`;
};

export function SettingsProvider({ children }) {
    const [callsign, setCallsign] = useLocalStorage({
        key: getSettingKey("callsign"),
        defaultValue: "",
        getInitialValueInEffect: false,
    });

    const [grid, setGrid] = useLocalStorage({
        key: getSettingKey("grid"),
        defaultValue: "",
        getInitialValueInEffect: false,
    });

    const [unitType, setUnitType] = useLocalStorage({
        key: getSettingKey("unitType"),
        defaultValue: UnitType.METRIC,
        getInitialValueInEffect: false,
    });

    const [timeMode, setTimeMode] = useLocalStorage({
        key: getSettingKey("timeMode"),
        defaultValue: TimeMode.UTC,
        getInitialValueInEffect: false,
    });

    const [displayMode, setDisplayMode] = useLocalStorage({
        key: getSettingKey("displayMode"),
        defaultValue: DisplayMode.LIGHT,
        getInitialValueInEffect: false,
    });

    const [showGreyline, setShowGreyline] = useLocalStorage({
        key: getSettingKey("showGreyline"),
        defaultValue: true,
        getInitialValueInEffect: false,
    });

    const [demoMode, setDemoMode] = useLocalStorage({
        key: getSettingKey("demoMode"),
        defaultValue: false,
        getInitialValueInEffect: false,
    });

    //master switch for the distance rings, plus one for each kind of ring
    const [showDistanceOverlay, setShowDistanceOverlay] = useLocalStorage({
        key: getSettingKey("showDistanceOverlay"),
        defaultValue: true,
        getInitialValueInEffect: false,
    });

    const [showDistanceRings, setShowDistanceRings] = useLocalStorage({
        key: getSettingKey("showDistanceRings"),
        defaultValue: true,
        getInitialValueInEffect: false,
    });

    const [showMaxDistance, setShowMaxDistance] = useLocalStorage({
        key: getSettingKey("showMaxDistance"),
        defaultValue: true,
        getInitialValueInEffect: false,
    });

    const [showFilters, setShowFilters] = useLocalStorage({
        key: getSettingKey("showFilters"),
        defaultValue: true,
        getInitialValueInEffect: false,
    });

    const [elevationValues, setElevationValues] = useLocalStorage({
        key: getSettingKey("elevationValues"),
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
        showDistanceOverlay,
        showDistanceRings,
        demoMode,
        showMaxDistance,
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
                setShowDistanceOverlay,
                setShowDistanceRings,
                setShowMaxDistance,
                setElevationValues,
                setShowFilters,
                setDemoMode,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    return useContext(SettingsContext);
}
