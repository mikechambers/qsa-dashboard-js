import {
    Group,
    Text,
    Paper,
    ActionIcon,
    Title,
    Button,
    ButtonGroup,
    Indicator,
} from "@mantine/core";
import { ConnectionStatusBadge } from "./ConnectionStatusBadge";
import {
    IconAdjustmentsHorizontal,
    IconBrandGithub,
    IconFilter2,
} from "@tabler/icons-react";

import { normalizeCallsign, normalizeMaidenHeadGrid } from "@/utils/radio";

import { useFullscreenDocument } from "@mantine/hooks";

import { IconArrowsMaximize, IconArrowsMinimize } from "@tabler/icons-react";

import { useSettings } from "@/contexts/SettingsContext";
import { useSpotData } from "@/contexts/SpotDataContext";
import { SETTINGS_PATH } from "@/consts/config";
import { useNavigate } from "react-router";

import { useBreakpoint } from "@/hooks/useBreakpoint";

import { ClockContainer } from "./ClockContainer";
import { ControlContainer } from "./ControlContainer";
import { Breakpoint } from "@/enums/Breakpoint";

export const HeaderContainer = ({ callsign, grid }) => {
    const { settings, setShowFilters } = useSettings();
    const breakpoint = useBreakpoint();
    const navigate = useNavigate();

    const { filter } = useSpotData();

    //todo: maybe normalize when we save?
    const cs = normalizeCallsign(callsign);
    const g = normalizeMaidenHeadGrid(grid);

    return (
        <Paper>
            <Group justify="space-between" wrap="nowrap">
                <Group gap="xs" align="baseline" wrap="nowrap">
                    <Title order={2} ff="monospace">
                        {cs}
                    </Title>
                    <Text fz="md" fw={500} c="dimmed" ff="monospace">
                        {g}
                    </Text>
                </Group>

                <ClockContainer breakpoint={breakpoint} />
                <Group wrap="nowrap" gap={16}>
                    <ConnectionStatusBadge breakpoint={breakpoint} />
                    <ControlContainer
                        compact={breakpoint === Breakpoint.COMPACT}
                    />
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="lg"
                        component="a"
                        href="https://github.com/mikechambers/qsa-dashboard-js"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View project home and source on GitHub"
                        title="View project home and source on GitHub"
                    >
                        <IconBrandGithub size={20} />
                    </ActionIcon>
                </Group>
            </Group>
        </Paper>
    );
};
