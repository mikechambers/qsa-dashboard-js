import { Table } from "@mantine/core";
import { useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { BandFrequencyView } from "./BandFrequencyView";
import { TimeView } from "./TimeView";
import { SNRView } from "./SNRView";
import { DistanceView } from "./DistanceView";
//import {useSpotData} from "@/context/SpotDataContext";

export const SpotTable = ({ spots, onSpotHighlight }) => {

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
			minWidth={400}
			maxHeight={600}
			scrollAreaProps={{ viewportRef: setScrollParent }}
		>
			<Table 
				styles={{ td: { verticalAlign: "top" } }}
				striped highlightOnHover withTableBorder withRowBorders={false}>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>UTC</Table.Th>

						<Table.Th ta="left">Loc</Table.Th>
						<Table.Th ta="right">Distance</Table.Th>
						<Table.Th ta="right">SNR</Table.Th>
						
		
						<Table.Th ta="center">Band</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{spots.map((spot) => {
						return (
							<Table.Tr key={spot.sequence} onMouseEnter={() => onSpotHighlight?.(spot)}>
								<Table.Td w={20}><TimeView date={spot.time} /></Table.Td>
						<Table.Td ta="left">{spot.senderDXCC.countryCode}</Table.Td>
								<Table.Td ta="right"><DistanceView distance={spot.distance} /></Table.Td>
								
								<Table.Td ta="right"><SNRView snr={spot.snr} /></Table.Td>
								
								<Table.Td ta="center">
									<BandFrequencyView 
									frequency={spot.frequency} 
									band={spot.band}/></Table.Td>
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
		time: new Date("2026-11-12T18:42:10Z"),
		mode: "FT8",
		band: "20M",
		frequency: 14074500,
		receiverCall: "DL1ABC",
		distance: 9120000,
		snr: -12,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 2,
		time: new Date("2026-11-12T18:43:25Z"),
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
		time: new Date("2026-11-12T18:44:02Z"),
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 4,
		time: new Date("2026-11-12T18:44:02Z"),
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 5,
		time: new Date("2026-11-12T18:44:02Z"),
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 6,
		time: new Date("2026-11-12T18:44:02Z"),
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 7,
		time: new Date("2026-11-12T18:44:02Z"),
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 8,
		time: new Date("2026-11-12T18:44:02Z"),
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 9,
		time: new Date("2026-11-12T18:44:02Z"),
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 10,
		time: new Date("2026-11-12T18:44:02Z"),
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 11,
		time: new Date("2026-11-12T18:44:02Z"),
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 12,
		time: new Date("2026-11-12T18:44:02Z"),
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 13,
		time: new Date("2026-11-12T18:44:02Z"),
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 14,
		time: new Date("2026-11-12T18:44:02Z"),
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
	{
		sequence: 15,
		time: new Date("2026-11-12T18:44:02Z"),
		mode: "FT4",
		band: "15M",
		frequency: 21140300,
		receiverCall: "VK3DEF",
		distance: 12050,
		snr: -5,
		senderDXCC: { countryCode: "US" },
	},
];