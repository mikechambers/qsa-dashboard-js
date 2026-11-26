/* MIT License
 *
 * Copyright (c) 2026 Mike Chambers
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { createContext, useContext } from "react";
import { useLocalStorage, useMediaQuery } from "@mantine/hooks";
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

    //filters are remembered separately on phones, where they start closed
    const isPhone = useMediaQuery("(max-width: 47.99em)", false, {
        getInitialValueInEffect: false,
    });

    const [showFiltersLarge, setShowFiltersLarge] = useLocalStorage({
        key: getSettingKey("showFilters"),
        defaultValue: true,
        getInitialValueInEffect: false,
    });

    const [showFiltersPhone, setShowFiltersPhone] = useLocalStorage({
        key: getSettingKey("showFiltersPhone"),
        defaultValue: false,
        getInitialValueInEffect: false,
    });

    const showFilters = isPhone ? showFiltersPhone : showFiltersLarge;
    const setShowFilters = isPhone ? setShowFiltersPhone : setShowFiltersLarge;

    //spots table open, or collapsed to a tab. Not shown in the config screen.
    const [showSpots, setShowSpots] = useLocalStorage({
        key: getSettingKey("showSpots"),
        defaultValue: true,
        getInitialValueInEffect: false,
    });

    //spot detail card on the map, expanded or collapsed. Not in the config screen.
    const [showSpotDetail, setShowSpotDetail] = useLocalStorage({
        key: getSettingKey("showSpotDetail"),
        defaultValue: true,
        getInitialValueInEffect: false,
    });

    //which markers are on the map. Not in the config screen
    const [showSpotMarkers, setShowSpotMarkers] = useLocalStorage({
        key: getSettingKey("showSpotMarkers"),
        defaultValue: true,
        getInitialValueInEffect: false,
    });

    const [showHeard, setShowHeard] = useLocalStorage({
        key: getSettingKey("showHeard"),
        defaultValue: true,
        getInitialValueInEffect: false,
    });

    const [showCQ, setShowCQ] = useLocalStorage({
        key: getSettingKey("showCQ"),
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
        showSpots,
        showSpotDetail,
        showSpotMarkers,
        showHeard,
        showCQ,
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
                setShowSpots,
                setShowSpotDetail,
                setShowSpotMarkers,
                setShowHeard,
                setShowCQ,
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
