import { useSettings } from "@/context/SettingsContext";
import { useInterval } from "@mantine/hooks";
import { formatTime } from "../../utils/view";
import { Paper, Title, Group } from "@mantine/core";
import { getShortTimeZoneName } from "../../utils/date";
import { useEffect, useState } from "react";

export const ClockView = () => {
    const { settings } = useSettings();
    const [time, setTime] = useState();

    const updateTime = () => {
        setTime(formatTime(new Date(), settings.timeMode, true));
    };

    const interval = useInterval(() => updateTime(), 1000);

    const timeZone = getShortTimeZoneName(settings.timeMode);

    useEffect(() => {
        interval.start();
        return interval.stop;
    }, []);

    return (
        <Paper>
            <Group justify="center">
                <Title order={1} ff="monospace">
                    {time} {timeZone}
                </Title>
            </Group>
        </Paper>
    );
};
