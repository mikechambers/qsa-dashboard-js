import { Group, Text, Paper, ActionIcon, Title, Button } from "@mantine/core";
import { ConnectionStatusView } from "./ConnectionStatusView";
import {
    IconAdjustmentsHorizontal,
    IconBrandGithub,
} from "@tabler/icons-react";

import { normalizeCallsign, normalizeMaidenHeadGrid } from "@/utils/radio";

export const DashboardHeaderView = ({ callsign, grid }) => {
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
                <Group gap="xs" wrap="nowrap">
                    <ConnectionStatusView />
                    <Button
                        variant="default"
                        component="a"
                        href="/"
                        leftSection={<IconAdjustmentsHorizontal size={16} />}
                    >
                        Config
                    </Button>

                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="lg"
                        component="a"
                        href="https://github.com/mikechambers/qsa-dashboard-js"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View source on GitHub"
                    >
                        <IconBrandGithub size={20} />
                    </ActionIcon>
                </Group>
            </Group>
        </Paper>
    );
};
