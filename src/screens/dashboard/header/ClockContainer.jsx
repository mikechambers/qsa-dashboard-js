import { useSettings } from "@/contexts/SettingsContext";
import { Breakpoint } from "@/enums/Breakpoint";
import { TimeMode } from "@/enums/TimeMode";

import { Group, Text } from "@mantine/core";
import { Clock } from "./Clock";

export const ClockContainer = ({ breakpoint }) => {
    const settings = useSettings();

    return (
        <Group>
            {" "}
            {breakpoint === Breakpoint.WIDE && (
                <>
                    <Clock timeMode={TimeMode.LOCAL} />
                    <Text c="dimmed">·</Text>
                    <Clock timeMode={TimeMode.UTC} />
                </>
            )}
            {breakpoint === Breakpoint.REGULAR && (
                <Clock timeMode={settings.timeMode} />
            )}
        </Group>
    );
};
