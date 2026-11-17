import { useSettings } from "@/context/SettingsContext";
import { useInterval } from "@mantine/hooks";
import { formatTime } from "../../utils/view";
import { Title, Group } from "@mantine/core";
import { getShortTimeZoneName } from "../../utils/date";
import { useEffect, useState } from "react";

export const ClockView = () => {
    const { settings } = useSettings();
    const [now, setNow] = useState(() => new Date());

    const interval = useInterval(() => setNow(new Date()), 1000);

    useEffect(() => {
        interval.start();
        return interval.stop;
    }, []);

    const time = formatTime(now, settings.timeMode, true);
    const timeZone = getShortTimeZoneName(settings.timeMode);

    return (
        <Group justify="center" visibleFrom="sm">
            <Title order={3} ff="monospace">
                {time} {timeZone}
            </Title>
        </Group>
    );
};
