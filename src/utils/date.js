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
