import {
    TextInput,
    Button,
    Radio,
    Fieldset,
    Stack,
    Group,
} from "@mantine/core";

import { useForm } from "@mantine/form";
//import { useLocalStorage } from '@mantine/hooks';
import { useSettings } from "@/context/SettingsContext";

import { useNavigate } from "react-router";
import { isValidCallsign, isValidMaidenHeadGrid } from "@/utils/radio";

import "./ConfigScreen.css";
import { UnitType } from "../../enums/UnitType";

export default function ConfigScreen(props) {
    const navigate = useNavigate();

    const { settings, setCallsign, setGrid, setUnitType } = useSettings();

    const form = useForm({
        initialValues: {
            callsign: settings.callsign,
            grid: settings.grid,
            unitType: settings.unitType,
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
        const m = props.unitType;

        setCallsign(c);
        setGrid(g);
        setUnitType(m);

        navigate(
            `/dashboard/${encodeURIComponent(c)}/${encodeURIComponent(g)}/`,
        );
    };

    return (
        <div id="configScreen" className="screen">
            <form onSubmit={form.onSubmit(onUpdateClick)}>
                <Fieldset legend="Station Setup">
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
                            placeholder="grid"
                            key={form.key("grid")}
                            {...form.getInputProps("grid")}
                        />

                        <Radio.Group
                            name="unitType"
                            label="Units"
                            key={form.key("unitType")}
                            {...form.getInputProps("unitType")}
                        >
                            <Group mt="xs" gap="lg" wrap="nowrap">
                                <Radio label="Metric" value={UnitType.METRIC} />
                                <Radio
                                    label="Imperial"
                                    value={UnitType.IMPERIAL}
                                />
                            </Group>
                        </Radio.Group>

                        <Button type="submit" variant="filled">
                            Update
                        </Button>
                    </Stack>
                </Fieldset>
            </form>
        </div>
    );
}
