/* MIT License
 *
 * Copyright (c) 2026 Mike Chambers
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
    Anchor,
} from "@mantine/core";

import { useForm } from "@mantine/form";
import { useSettings } from "@/contexts/SettingsContext";

import { isValidCallsign, isValidMaidenHeadGrid } from "@/utils/radio";

import { useNavigate, Link } from "react-router";
import classes from "./ConfigScreen.module.css";
import screenClasses from "../screens.module.css";
import { UnitType } from "@/enums/UnitType";
import { TimeMode } from "@/enums/TimeMode";
import { DisplayMode } from "@/enums/DisplayMode";
import { ElevationValue } from "@/lib/twilight";

import { ABOUT_PATH, DASHBOARD_PATH } from "@/consts/config";

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

const SwatchLabel = ({ text, color }) => (
    <Group gap="xs" wrap="nowrap" justify="space-between">
        <span>{text}</span>
        <Box w={24} h={4} bg={color} style={{ borderRadius: 2 }} />
    </Group>
);

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
        setShowDistanceOverlay,
        setShowDistanceRings,
        setShowMaxDistance,
        setElevationValues,
        setDemoMode,
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

        navigate(DASHBOARD_PATH);
    };

    const hasCallsign =
        settings.callsign != null && settings.callsign.length > 0;

    return (
        <div
            className={`${screenClasses.centerScreen} ${screenClasses.screen}`}
        >
            <form
                className={`${classes.configForm} ${screenClasses.footerPadding}`}
                onSubmit={form.onSubmit(onUpdateClick)}
            >
                <Stack gap="lg">
                    <Group>
                        <Anchor
                            component={Link}
                            to={DASHBOARD_PATH}
                            underline={!hasCallsign}
                            c={!hasCallsign ? "dimmed" : undefined}
                            fw={!hasCallsign ? 500 : 400}
                            style={{
                                cursor: !hasCallsign ? "default" : "pointer",
                            }}
                        >
                            Dashboard
                        </Anchor>
                        |
                        <Anchor
                            component={Link}
                            to={ABOUT_PATH}
                            underline="hover"
                        >
                            About
                        </Anchor>
                    </Group>

                    {!hasCallsign && (
                        <Group pt="md" justify="center">
                            <Text size="sm" c="dimmed">
                                Enter Station info to view dashboard
                            </Text>
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

                            <Divider />

                            <Switch
                                label="Distance rings"
                                description="Draw distance rings around your station"
                                labelPosition="left"
                                disabled={
                                    !settings.showDistanceRings &&
                                    !settings.showMaxDistance
                                }
                                checked={settings.showDistanceOverlay}
                                onChange={(e) =>
                                    setShowDistanceOverlay(
                                        e.currentTarget.checked,
                                    )
                                }
                                styles={{
                                    body: { justifyContent: "space-between" },
                                }}
                            />

                            <Stack gap="md">
                                <Checkbox
                                    disabled={!settings.showDistanceOverlay}
                                    checked={settings.showDistanceRings}
                                    onChange={(e) =>
                                        setShowDistanceRings(
                                            e.currentTarget.checked,
                                        )
                                    }
                                    label={
                                        <SwatchLabel
                                            text="Distance"
                                            color="gray.6"
                                        />
                                    }
                                    styles={{
                                        label: { width: "100%" },
                                        labelWrapper: { flex: 1 },
                                    }}
                                />
                                <Checkbox
                                    disabled={!settings.showDistanceOverlay}
                                    checked={settings.showMaxDistance}
                                    onChange={(e) =>
                                        setShowMaxDistance(
                                            e.currentTarget.checked,
                                        )
                                    }
                                    label={
                                        <SwatchLabel
                                            text="Max distance"
                                            color="teal.6"
                                        />
                                    }
                                    styles={{
                                        label: { width: "100%" },
                                        labelWrapper: { flex: 1 },
                                    }}
                                />
                                <Text size="xs" c="dimmed">
                                    Note: Larger distance rings may look
                                    distorted due to how the map projection
                                    stretches the world.
                                </Text>
                            </Stack>
                            <Divider />
                        </Stack>
                    </Fieldset>
                    <Fieldset legend="Demo">
                        <Stack gap="md">
                            <Checkbox
                                checked={settings.demoMode}
                                onChange={(e) =>
                                    setDemoMode(e.currentTarget.checked)
                                }
                                label="Add Mock Spots"
                                styles={{
                                    label: { width: "100%" },
                                    labelWrapper: { flex: 1 },
                                }}
                            />
                            <Text size="xs" c="dimmed">
                                Adds generated spot data. Change requires{" "}
                                <Anchor
                                    component="button"
                                    type="button"
                                    inherit
                                    onClick={() => window.location.reload()}
                                >
                                    page refresh
                                </Anchor>{" "}
                                to take effect.
                            </Text>
                        </Stack>
                    </Fieldset>
                </Stack>
            </form>
        </div>
    );
}
