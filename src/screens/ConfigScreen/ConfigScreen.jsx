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
import { MeasurementType } from "../../enums/MeasurementType";

export default function ConfigScreen(props) {
	const navigate = useNavigate();

	const { settings, setCallsign, setGrid, setMeasurement } = useSettings();

	const form = useForm({
		initialValues: {
			callsign: settings.callsign,
			grid: settings.grid,
			measurement: settings.measurement,
		},
		validate: {
			callsign: (callsign) => {
				return isValidCallsign(callsign.trim()) ? null : "Invalid Callsign";
			},
			grid: (grid) => {
				let o = isValidMaidenHeadGrid(grid.trim());
				console.log(grid, o);

				return o ? null : "Invalid Maidenhead Grid";
			},
		},
	});

	const onUpdateClick = (props) => {
		const c = props.callsign.trim();
		const g = props.grid.trim();
        const m = props.measurement;

		setCallsign(c);
		setGrid(g);
        setMeasurement(m);

		navigate(`/dashboard/${encodeURIComponent(c)}/${encodeURIComponent(g)}/`);
	};

	return (
		<div id="configScreen" className="screen">
			<form onSubmit={form.onSubmit(onUpdateClick)}>
				<Fieldset legend="Station Setup">
					<Stack gap="md">
						<TextInput
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
							name="measurement"
							label="Units"
							key={form.key("measurement")}
							{...form.getInputProps("measurement")}
						>
							<Group mt="xs" gap="lg" wrap="nowrap">
								<Radio
									name="measurement"
									label="Metric"
									value={MeasurementType.METRIC}
									defaultChecked
								/>
								<Radio
									name="measurement"
									label="Imperial"
									value={MeasurementType.IMPERIAL}
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
