import { useSettings } from "@/contexts/SettingsContext";
import { useInterval } from "@mantine/hooks";
import { formatTime } from "../../../utils/view";
import { Title, Group } from "@mantine/core";
import { getShortTimeZoneName } from "../../../utils/date";
import { useEffect, useState } from "react";

export const ClockView = ({ timeMode, isSecondary }) => {
    const [now, setNow] = useState(() => new Date());
    const { settings } = useSettings();
    const interval = useInterval(() => setNow(new Date()), 1000);

    const c = timeMode == settings.timeMode ? undefined : "dimmed";

    useEffect(() => {
        interval.start();
        return interval.stop;
    }, []);

    const time = formatTime(now, timeMode, true);
    const timeZone = getShortTimeZoneName(timeMode);

    return (
        <Group c={c} justify="center" visibleFrom="sm">
            <Title order={3} ff="monospace">
                {time} {timeZone}
            </Title>
        </Group>
    );
};
