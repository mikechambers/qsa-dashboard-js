import { useState, useEffect, useMemo } from "react";
import { SummaryBase } from "./PodBase";
import { formatHMS } from "@/utils/view";
import { timeAgo } from "@/utils/date";
import { useInterval } from "@mantine/hooks";

let sessionStart = null;

const elapsedSeconds = () => {
    sessionStart ??= Date.now();
    return Math.floor((Date.now() - sessionStart) / 1000);
};

export const ElapsedTimePod = ({ mostRecentSpot }) => {
    const [seconds, setSeconds] = useState(elapsedSeconds);
    const interval = useInterval(() => setSeconds(elapsedSeconds()), 1000);

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
