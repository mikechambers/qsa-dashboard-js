import { UnitType } from "@/enums/UnitType";
import { kilometersToMiles } from "@/utils/geo";
import { TimeMode } from "../enums/TimeMode";
import { SignalColor } from "../enums/SignalColors";

const distanceFormatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
});

export const formatNumber = (n) => {
    return distanceFormatter.format(n);
};

export const convertAndFormatDistance = (km, unitType) => {
    const miles = unitType === UnitType.IMPERIAL;

    const d = formatNumber(miles ? kilometersToMiles(km) : km);

    return { d, unit: miles ? "mi" : "km" };
};

export const formatFrequency = (frequencyHz) => {
    if (
        typeof frequencyHz !== "number" ||
        Number.isNaN(frequencyHz) ||
        frequencyHz <= 0
    ) {
        return "";
    }

    const mhz = frequencyHz / 1_000_000;

    const decimals = 3;

    const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: false,
    }).format(mhz);

    return formatted;
};

export const formatTime = (date, timeMode, showSeconds = false) => {
    let time = "";

    if (!date) {
        return time;
    }

    time = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timeMode === TimeMode.UTC ? "UTC" : undefined,
        second: showSeconds ? "2-digit" : undefined,
        hourCycle: "h23",
    }).format(date);

    return time;
};

export const getCSSColorForSNR = (snr) => {
    return SignalColor.getColorForSNR(snr);
};

export const formatHMS = (total) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = Math.floor(total % 60);
    return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
};
