import { SummaryBase } from "./pods/PodBase";
import { formatHMS } from "@/utils/view";
import { useInterval } from "@mantine/hooks";
import { useEffect, useState } from "react";

export const RecentContactPod = ({ mostRecentSpot }) => {
    const [now, setNow] = useState(Date.now());

    const interval = useInterval(() => setNow(Date.now()), 1000);

    useEffect(() => {
        interval.start();
        return interval.stop;
    }, []);

    const f = mostRecentSpot
        ? formatHMS((now - mostRecentSpot.date.getTime()) / 1000)
        : undefined;

    return <SummaryBase label="Since Last Contact" value={f} />;
};
