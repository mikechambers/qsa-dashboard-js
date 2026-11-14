import { UnitType } from "@/enums/UnitType";
import { metersToMiles } from "@/utils/geo";

export const formatDistance = (distance, unitType) => {
    let d = "-";
    let unit = "km";

    if (distance !== undefined) {
        if (unitType === UnitType.IMPERIAL) {
            d = `${Math.round(metersToMiles(distance))}`;
            unit = " mi";
        } else {
            d = `${Math.round(distance / 1000)}`;
            unit = " km";
        }
    }

    return { d, unit };
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

export const formatTime = (date, showSeconds = false) => {
    let time = "";

    if (!date) {
        return time;
    }

    let options = {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",

        hourCycle: "h23",
    };

    if (showSeconds) {
        options = { ...options, second: "2-digit" };
    }

    time = new Intl.DateTimeFormat("en-GB", options).format(date);

    return time;
};
