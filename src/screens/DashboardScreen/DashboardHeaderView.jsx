import {
    Group,
    Text,
    Paper,
    ActionIcon,
    Title,
    Button,
    ButtonGroup,
    Toggle,
} from "@mantine/core";
import { ConnectionStatusView } from "./ConnectionStatusView";
import {
    IconAdjustmentsHorizontal,
    IconBrandGithub,
    IconFilter2,
    IconFilter2Search,
    IconFilter2X,
    IconListSearch,
} from "@tabler/icons-react";

import { normalizeCallsign, normalizeMaidenHeadGrid } from "@/utils/radio";
import { ClockView } from "./ClockView";
import { useFullscreenDocument } from "@mantine/hooks";

import { IconArrowsMaximize, IconArrowsMinimize } from "@tabler/icons-react";
import { TimeMode } from "@/enums/TimeMode";
import { useSettings } from "@/context/SettingsContext";

export const DashboardHeaderView = ({ callsign, grid }) => {
    const { toggle, fullscreen } = useFullscreenDocument();
    const { settings, setShowFilters } = useSettings();

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
                <Group>
                    <ClockView timeMode={TimeMode.LOCAL} />
                    <Text c="dimmed">·</Text>
                    <ClockView timeMode={TimeMode.UTC} />
                </Group>
                <Group wrap="nowrap" gap={32}>
                    <ConnectionStatusView />
                    <ButtonGroup>
                        <Button
                            variant={settings.showFilters ? "light" : "default"}
                            onClick={() =>
                                setShowFilters(!settings.showFilters)
                            }
                            aria-pressed={settings.showFilters}
                            leftSection={<IconFilter2 size={16} />}
                        >
                            Filters
                        </Button>
                        <Button
                            variant="default"
                            component="a"
                            href="/"
                            leftSection={
                                <IconAdjustmentsHorizontal size={16} />
                            }
                        >
                            Config
                        </Button>

                        <Button
                            variant="default"
                            onClick={toggle}
                            px="xs"
                            aria-label={
                                fullscreen
                                    ? "Exit fullscreen"
                                    : "Enter fullscreen"
                            }
                        >
                            {fullscreen ? (
                                <IconArrowsMinimize size={18} />
                            ) : (
                                <IconArrowsMaximize size={18} />
                            )}
                        </Button>
                    </ButtonGroup>
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
