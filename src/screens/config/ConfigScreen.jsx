import {
    TextInput,
    Button,
    Fieldset,
    Stack,
    Group,
    Box,
    Text,
    Switch,
    Checkbox,
    Divider,
    SegmentedControl,
} from "@mantine/core";

import { useForm } from "@mantine/form";
import { useSettings } from "@/contexts/SettingsContext";

import { useNavigate } from "react-router";
import { isValidCallsign, isValidMaidenHeadGrid } from "@/utils/radio";

import classes from "./ConfigScreen.module.css";
import screenClasses from "../screens.module.css";
import { UnitType } from "@/enums/UnitType";
import { TimeMode } from "@/enums/TimeMode";
import { DisplayMode } from "@/enums/DisplayMode";
import { ElevationValue } from "@/lib/twilight";

const greylineLayers = [
    {
        value: ElevationValue.HORIZON,
        label: "Horizon",
        color: "orange.7",
    },
    {
        value: ElevationValue.CIVIL,
        label: "Civil twilight",
        color: "blue.7",
    },
    {
        value: ElevationValue.NAUTICAL,
        label: "Nautical twilight",
        color: "violet.9",
    },
    {
        value: ElevationValue.ASTRONOMICAL,
        label: "Astronomical twilight",
        color: "gray.7",
    },
];

export default function ConfigScreen() {
    const navigate = useNavigate();

    const {
        settings,
        setCallsign,
        setGrid,
        setUnitType,
        setTimeMode,
        setDisplayMode,
        setShowGreyline,
        setElevationValues,
    } = useSettings();

    const form = useForm({
        initialValues: {
            callsign: settings.callsign,
            grid: settings.grid,
        },
        validate: {
            callsign: (callsign) => {
                return isValidCallsign(callsign.trim())
                    ? null
                    : "Invalid Callsign";
            },
            grid: (grid) => {
                const g = grid.trim();

                if (!g.length) {
                    return null;
                }

                let o = isValidMaidenHeadGrid(grid);

                return o ? null : "Invalid Maidenhead Grid";
            },
        },
    });

    const onUpdateClick = (props) => {
        const c = props.callsign.trim();
        const g = props.grid.trim();

        setCallsign(c);
        setGrid(g);

        navigate(
            `/dashboard/${encodeURIComponent(c)}/${encodeURIComponent(g)}/`,
        );
    };

    const onBackClick = () => {
        navigate(
            `/dashboard/${encodeURIComponent(settings.callsign)}/${encodeURIComponent(settings.grid)}/`,
        );
    };

    return (
        <div className={`${classes.configScreen} ${screenClasses.screen}`}>
            <form
                className={classes.configForm}
                onSubmit={form.onSubmit(onUpdateClick)}
            >
                <Stack gap="lg">
                    {settings.callsign && (
                        <Group>
                            <Button
                                variant="subtle"
                                size="compact-sm"
                                onClick={onBackClick}
                            >
                                ← Back to dashboard
                            </Button>
                        </Group>
                    )}
                    <Fieldset legend="Station">
                        <Stack gap="md">
                            <TextInput
                                required
                                label="Callsign"
                                placeholder="callsign"
                                key={form.key("callsign")}
                                {...form.getInputProps("callsign")}
                            />
                            <TextInput
                                label="Location Grid"
                                description="Maidenhead locator, 4 or 6 characters"
                                placeholder="grid"
                                key={form.key("grid")}
                                {...form.getInputProps("grid")}
                            />
                            <Button type="submit" variant="filled">
                                Update station
                            </Button>
                        </Stack>
                    </Fieldset>

                    <Fieldset legend="Display">
                        <Stack gap="md">
                            <Stack gap={4}>
                                <Text size="sm" fw={600}>
                                    Theme
                                </Text>
                                <SegmentedControl
                                    fullWidth
                                    value={settings.displayMode}
                                    onChange={setDisplayMode}
                                    data={[
                                        {
                                            label: "Light",
                                            value: DisplayMode.LIGHT,
                                        },
                                        {
                                            label: "Dark",
                                            value: DisplayMode.DARK,
                                        },
                                    ]}
                                />
                            </Stack>

                            <Stack gap={4}>
                                <Text size="sm" fw={600}>
                                    Units
                                </Text>
                                <SegmentedControl
                                    fullWidth
                                    value={settings.unitType}
                                    onChange={setUnitType}
                                    data={[
                                        {
                                            label: "Metric",
                                            value: UnitType.METRIC,
                                        },
                                        {
                                            label: "Imperial",
                                            value: UnitType.IMPERIAL,
                                        },
                                    ]}
                                />
                            </Stack>

                            <Stack gap={4}>
                                <Text size="sm" fw={600}>
                                    Time Zone
                                </Text>
                                <SegmentedControl
                                    fullWidth
                                    value={settings.timeMode}
                                    onChange={setTimeMode}
                                    data={[
                                        { label: "UTC", value: TimeMode.UTC },
                                        {
                                            label: "Local",
                                            value: TimeMode.LOCAL,
                                        },
                                    ]}
                                />
                            </Stack>
                        </Stack>
                    </Fieldset>

                    <Fieldset legend="Map overlays">
                        <Stack gap="md">
                            <Switch
                                label="Grey Line"
                                description="Display grey line and twilight bands"
                                labelPosition="left"
                                disabled={settings.elevationValues.length == 0}
                                checked={settings.showGreyline}
                                onChange={(e) =>
                                    setShowGreyline(e.currentTarget.checked)
                                }
                                styles={{
                                    body: { justifyContent: "space-between" },
                                }}
                            />

                            <Divider />

                            <Checkbox.Group
                                value={settings.elevationValues}
                                onChange={setElevationValues}
                            >
                                <Stack gap="md">
                                    {greylineLayers.map((layer) => (
                                        <Checkbox
                                            key={layer.value}
                                            value={layer.value}
                                            disabled={!settings.showGreyline}
                                            label={
                                                <Group
                                                    gap="xs"
                                                    wrap="nowrap"
                                                    justify="space-between"
                                                >
                                                    <span>{layer.label}</span>
                                                    <Box
                                                        w={24}
                                                        h={4}
                                                        bg={layer.color}
                                                        style={{
                                                            borderRadius: 2,
                                                        }}
                                                    />
                                                </Group>
                                            }
                                            styles={{
                                                label: { width: "100%" },
                                                labelWrapper: { flex: 1 },
                                            }}
                                        />
                                    ))}
                                </Stack>
                            </Checkbox.Group>
                        </Stack>
                    </Fieldset>
                </Stack>
            </form>
        </div>
    );
}
