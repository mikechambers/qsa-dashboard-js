import { TimeMode } from "../enums/TimeMode";

export const epochToDate = (epoch) => {
    if (epoch == null) {
        return null;
    }

    return new Date(epoch * 1000);
};

export const getShortTimeZoneName = (timeMode) => {
    if (!timeMode || timeMode === TimeMode.UTC) {
        return "UTC";
    }

    const parts = new Intl.DateTimeFormat("en-US", {
        timeZoneName: "short",
    }).formatToParts(new Date());

    return parts.find((part) => part.type === "timeZoneName")?.value ?? "";
};

//todo: could make this more general and re-usable
export function timeAgo(date) {
    if (!date) return "";

    const secondsElapsed = Math.floor(
        (Date.now() - new Date(date).getTime()) / 1000,
    );

    const intervals = [
        { label: "days", seconds: 86400 },
        { label: "hour", seconds: 3600 },
        { label: "minute", seconds: 60 },
        { label: "second", seconds: 1 },
    ];

    const rtf = new Intl.RelativeTimeFormat("en", {
        numeric: "auto",
        style: "narrow",
    });

    for (const interval of intervals) {
        const count = Math.floor(secondsElapsed / interval.seconds);
        if (count >= 1) {
            return rtf.format(-count, interval.label);
        }
    }

    return rtf.format(0, "second");
}
