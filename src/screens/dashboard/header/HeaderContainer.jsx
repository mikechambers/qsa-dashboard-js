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
import { Clock } from "./Clock";
import { useFullscreenDocument } from "@mantine/hooks";

import { IconArrowsMaximize, IconArrowsMinimize } from "@tabler/icons-react";
import { TimeMode } from "@/enums/TimeMode";
import { useSettings } from "@/contexts/SettingsContext";
import { useSpotData } from "@/contexts/SpotDataContext";

export const HeaderContainer = ({ callsign, grid }) => {
    const { toggle, fullscreen } = useFullscreenDocument();
    const { settings, setShowFilters } = useSettings();

    const { spots, filteredSpots } = useSpotData();

    //todo: maybe normalize when we save?
    const cs = normalizeCallsign(callsign);
    const g = normalizeMaidenHeadGrid(grid);

    const hasActiveFilters = spots.length !== filteredSpots.length;

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
                    <Clock timeMode={TimeMode.LOCAL} />
                    <Text c="dimmed">·</Text>
                    <Clock timeMode={TimeMode.UTC} />
                </Group>
                <Group wrap="nowrap" gap={32}>
                    <ConnectionStatusBadge />
                    <ButtonGroup>
                        <Button
                            variant={settings.showFilters ? "light" : "default"}
                            onClick={() =>
                                setShowFilters(!settings.showFilters)
                            }
                            aria-pressed={settings.showFilters}
                            aria-label={
                                settings.showFilters
                                    ? "Close Filters"
                                    : "Show Filters"
                            }
                            title={
                                settings.showFilters
                                    ? "Close Filters"
                                    : "Show Filters"
                            }
                            leftSection={
                                <Indicator
                                    disabled={!hasActiveFilters}
                                    size={7}
                                    offset={1}
                                    color="orange"
                                    processing
                                >
                                    <IconFilter2 size={16} />
                                </Indicator>
                            }
                        >
                            Filters
                        </Button>
                        <Button
                            variant="default"
                            component="a"
                            title="Open Settings"
                            href="/"
                            leftSection={
                                <IconAdjustmentsHorizontal size={16} />
                            }
                        >
                            Settings
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
