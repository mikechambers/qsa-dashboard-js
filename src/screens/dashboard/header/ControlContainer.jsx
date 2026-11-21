import { SETTINGS_PATH } from "@/consts/config";
import { useSettings } from "@/contexts/SettingsContext";
import { useSpotData } from "@/contexts/SpotDataContext";
import { Button, ButtonGroup, Indicator } from "@mantine/core";
import { useFullscreenDocument } from "@mantine/hooks";
import {
    IconArrowsMaximize,
    IconArrowsMinimize,
    IconFilter2,
    IconAdjustmentsHorizontal,
} from "@tabler/icons-react";
import { useNavigate } from "react-router";

export const ControlContainer = ({ compact = false }) => {
    const { toggle, fullscreen } = useFullscreenDocument();
    const { settings, setShowFilters } = useSettings();
    const { filter } = useSpotData();
    const navigate = useNavigate();

    const filterIcon = (
        <Indicator
            disabled={!filter.hasFilter()}
            size={7}
            offset={1}
            color="orange"
            processing
        >
            <IconFilter2 size={16} />
        </Indicator>
    );

    return (
        <ButtonGroup>
            <Button
                variant={settings.showFilters ? "light" : "default"}
                onClick={() => setShowFilters(!settings.showFilters)}
                aria-pressed={settings.showFilters}
                aria-label={
                    settings.showFilters ? "Close Filters" : "Show Filters"
                }
                title={settings.showFilters ? "Close Filters" : "Show Filters"}
                leftSection={!compact && filterIcon}
                styles={{ label: { overflow: "visible" } }}
            >
                {compact ? filterIcon : "Filters"}
            </Button>
            <Button
                variant="default"
                title="Open Settings"
                onClick={() => navigate(SETTINGS_PATH)}
                leftSection={
                    !compact && <IconAdjustmentsHorizontal size={16} />
                }
            >
                {compact ? <IconAdjustmentsHorizontal size={16} /> : "Settings"}
            </Button>

            <Button
                variant="default"
                onClick={toggle}
                px="xs"
                aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
                {fullscreen ? (
                    <IconArrowsMinimize size={18} />
                ) : (
                    <IconArrowsMaximize size={18} />
                )}
            </Button>
        </ButtonGroup>
    );
};
