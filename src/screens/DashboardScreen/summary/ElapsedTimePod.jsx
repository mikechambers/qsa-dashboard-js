import { useState, useEffect } from "react";
import { SummaryPodView } from "./SummaryPodView";
import { formatHMS } from "@/utils/view";
import { useInterval } from "@mantine/hooks";

export const ElapsedTimePod = () => {
    const [seconds, setSeconds] = useState(0);

    const updateTime = () => {
        setSeconds(seconds + 1);
    };

    const interval = useInterval(() => updateTime(), 1000);

    useEffect(() => {
        interval.start();
        return interval.stop;
    }, []);

    const f = formatHMS(seconds);

    return (
        <SummaryPodView
            label="Elapsed"
            value={f}
            subvalue={"subvalue"}
            useMonospace={true}
        />
    );
};
