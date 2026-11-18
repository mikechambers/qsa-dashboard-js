import { SummaryPodView } from "./summary/SummaryPodView";
import { formatHMS } from "@/utils/view";
import { useInterval } from "@mantine/hooks";
import { useEffect, useState } from "react";

export const RecentContactPod = ({ mostRecentContact }) => {
    const [now, setNow] = useState(Date.now());

    const interval = useInterval(() => setNow(Date.now()), 1000);

    useEffect(() => {
        interval.start();
        return interval.stop;
    }, []);

    const f = mostRecentContact
        ? formatHMS((now - mostRecentContact.date.getTime()) / 1000)
        : undefined;

    return <SummaryPodView label="Since Last Contact" value={f} />;
};
