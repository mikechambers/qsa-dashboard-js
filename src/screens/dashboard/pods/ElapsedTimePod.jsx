import { useState, useEffect } from "react";
import { SummaryBase } from "./PodBase";
import { formatHMS } from "@/utils/view";
import { useInterval } from "@mantine/hooks";

//todo: could make this more general and re-usable
function timeAgo(date) {
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

export const ElapsedTimePod = ({ mostRecentSpot }) => {
    const [seconds, setSeconds] = useState(0);

    const updateTime = () => {
        setSeconds(seconds + 1);
    };

    const interval = useInterval(() => updateTime(), 1000);

    const subvalue = mostRecentSpot
        ? `last spot ${timeAgo(mostRecentSpot.date)}`
        : "";

    useEffect(() => {
        interval.start();
        return interval.stop;
    }, []);

    const f = formatHMS(seconds);

    return (
        <SummaryBase
            label="Session"
            value={f}
            subvalue={subvalue}
            useMonospace={true}
        />
    );
};
