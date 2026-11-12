import { Table } from "@mantine/core";
import { useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
//import {useSpotData} from "@/context/SpotDataContext";

export const SpotTable = ({ spots }) => {

    //todo
	spots = debugSpots;

	const [scrollParent, setScrollParent] = useState(null);

	const virtualizer = useVirtualizer({
		count: spots.length,
		getScrollElement: () => scrollParent,
		estimateSize: () => 36,
		overscan: 20,
		getItemKey: (index) => spots[index].sequence,
	});

	const virtualItems = virtualizer.getVirtualItems();

	return (
		<Table.ScrollContainer
			minWidth={760}
			maxHeight={400}
			scrollAreaProps={{ viewportRef: setScrollParent }}
		>
			<Table striped highlightOnHover withTableBorder withRowBorders={false}>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>Time</Table.Th>

						<Table.Th ta="right">Receiver</Table.Th>
						<Table.Th ta="right">Distance</Table.Th>
						<Table.Th ta="right">SNR</Table.Th>
						<Table.Th ta="right">Location</Table.Th>
						<Table.Th ta="right">Mode</Table.Th>
						<Table.Th ta="right">Band</Table.Th>
						<Table.Th ta="right">Frequency</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{spots.map((spot) => {
						return (
							<Table.Tr key={spot.sequence}>
								<Table.Td>{spot.time}</Table.Td>
								<Table.Td ta="right">{spot.receiverCall}</Table.Td>
								<Table.Td ta="right">{spot.distance}m</Table.Td>
								<Table.Td ta="right">{spot.snr} db</Table.Td>
								<Table.Td ta="right">{spot.senderDXCC.countryCode}</Table.Td>
								<Table.Td ta="right">{spot.mode}</Table.Td>
								<Table.Td ta="right">{spot.band}</Table.Td>
								<Table.Td ta="right">{spot.frequency}</Table.Td>
							</Table.Tr>
						);
					})}
				</Table.Tbody>
			</Table>
		</Table.ScrollContainer>
	);
};

const debugSpots = [
	{
		sequence: 1,
		time: "2026-11-12T18:42:10Z",
		mode: "FT8",
		band: "20M",
		frequency: 14074500,
		receiverCall: "DL1ABC",
		distance: 9120,
		snr: -12,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 2,
		time: "2026-11-12T18:43:25Z",
		mode: "FT8",
		band: "40M",
		frequency: 7075800,
		receiverCall: "JA1XYZ",
		distance: 8310,
		snr: -18,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 3,
		time: "2026-11-12T18:44:02Z",
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 3,
		time: "2026-11-12T18:44:02Z",
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 3,
		time: "2026-11-12T18:44:02Z",
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 3,
		time: "2026-11-12T18:44:02Z",
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 3,
		time: "2026-11-12T18:44:02Z",
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 3,
		time: "2026-11-12T18:44:02Z",
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 3,
		time: "2026-11-12T18:44:02Z",
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 3,
		time: "2026-11-12T18:44:02Z",
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 3,
		time: "2026-11-12T18:44:02Z",
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 3,
		time: "2026-11-12T18:44:02Z",
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 3,
		time: "2026-11-12T18:44:02Z",
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 3,
		time: "2026-11-12T18:44:02Z",
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 3,
		time: "2026-11-12T18:44:02Z",
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
];
