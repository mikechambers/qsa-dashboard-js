import { UnitType } from "@/enums/UnitType";
import { kilometersToMiles } from "@/utils/geo";
import { clamp } from "@/utils/math";
import { TimeMode } from "../enums/TimeMode";

const distanceFormatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
});

export const formatNumber = (n) => {
    return distanceFormatter.format(n);
};

export const convertAndFormatDistance = (km, unitType) => {
    const miles = unitType === "imperial";

    const d = formatNumber(miles ? kilometersToMiles(km) : km);

    return { d, unit: miles ? "mi" : "km" };
};

export const formatFrequency = (frequency) => {
    let f = "";
    if (frequency) {
        f = new Intl.NumberFormat("de-DE", {
            maximumFractionDigits: 0,
        }).format(frequency / 1000);
    }

    return f;
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
    const s = clamp(snr, -22, -10);

    const hue = ((s + 22) / 12) * 120;

    return `hsl(${hue}, 90%, 50%)`;
};

export const formatHMS = (total) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = Math.floor(total % 60);
    return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
};
