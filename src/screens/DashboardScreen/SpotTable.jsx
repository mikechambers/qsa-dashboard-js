import { Paper, Table, Title, Group, Text } from "@mantine/core";
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
        <Paper p={0}>
            <Group>
            <Title order={3}>Spots</Title>
            </Group>
            <Table.ScrollContainer
                minWidth={400}
                maxHeight={600}
                scrollAreaProps={{ viewportRef: setScrollParent }}
            >
                <Table
                    styles={{ td: { verticalAlign: "top" } }}
                    highlightOnHover
                    withTableBorder
                    withRowBorders={true}
                    verticalSpacing="xs"
                    horizontalSpacing="md"
                    highlightOnHoverColor="var(--mantine-primary-color-light)"
                >
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
                                <Table.Tr
                                    key={spot.sequence}
                                    onMouseEnter={() => onSpotHighlight?.(spot)}
                                >
                                    <Table.Td w={20}>
                                        <TimeView date={spot.time} />
                                    </Table.Td>
                                    <Table.Td ta="left">
                                        <Text size="sm">{spot.senderDXCC.countryCode}</Text>
                                        
                                    </Table.Td>
                                    <Table.Td ta="right">
                                        <DistanceView
                                            distance={spot.distance}
                                        />
                                    </Table.Td>

                                    <Table.Td ta="right">
                                        <SNRView snr={spot.snr} />
                                    </Table.Td>

                                    <Table.Td ta="center">
                                        <BandFrequencyView
                                            frequency={spot.frequency}
                                            band={spot.band}
                                        />
                                    </Table.Td>
                                </Table.Tr>
                            );
                        })}
                    </Table.Tbody>
                </Table>
            </Table.ScrollContainer>
        </Paper>
    );
};
const debugSpots = [
    {
        sequence: 1,
        time: new Date("2026-11-12T18:42:15Z"),
        mode: "FT8",
        band: "20M",
        frequency: 14075230,
        receiverCall: "VE7DLX",
        distance: 1310000,
        snr: -8,
        senderDXCC: { countryCode: "US" },
        location: { latitude: 49.28, longitude: -123.12 },
    },
    {
        sequence: 2,
        time: new Date("2026-11-12T18:42:30Z"),
        mode: "FT8",
        band: "20M",
        frequency: 14076810,
        receiverCall: "W7GJ",
        distance: 1130000,
        snr: -3,
        senderDXCC: { countryCode: "US" },
        location: { latitude: 47.61, longitude: -122.33 },
    },
    {
        sequence: 3,
        time: new Date("2026-11-12T18:42:45Z"),
        mode: "FT8",
        band: "20M",
        frequency: 14074960,
        receiverCall: "KH6BZF",
        distance: 3900000,
        snr: -11,
        senderDXCC: { countryCode: "US" },
        location: { latitude: 21.31, longitude: -157.86 },
    },
    {
        sequence: 4,
        time: new Date("2026-11-12T18:43:00Z"),
        mode: "FT8",
        band: "20M",
        frequency: 14077350,
        receiverCall: "W5QY",
        distance: 2400000,
        snr: -15,
        senderDXCC: { countryCode: "US" },
        location: { latitude: 32.78, longitude: -96.8 },
    },
    {
        sequence: 5,
        time: new Date("2026-11-12T18:43:07Z"),
        mode: "FT4",
        band: "15M",
        frequency: 21141800,
        receiverCall: "VK3DEF",
        distance: 12700000,
        snr: -5,
        senderDXCC: { countryCode: "US" },
        location: { latitude: -37.81, longitude: 144.96 },
    },
    {
        sequence: 6,
        time: new Date("2026-11-12T18:43:15Z"),
        mode: "FT8",
        band: "20M",
        frequency: 14075870,
        receiverCall: "N1ABC",
        distance: 4300000,
        snr: -19,
        senderDXCC: { countryCode: "US" },
        location: { latitude: 42.36, longitude: -71.06 },
    },
    {
        sequence: 7,
        time: new Date("2026-11-12T18:43:30Z"),
        mode: "FT8",
        band: "17M",
        frequency: 18101640,
        receiverCall: "JH1GEN",
        distance: 8300000,
        snr: -21,
        senderDXCC: { countryCode: "US" },
        location: { latitude: 35.68, longitude: 139.69 },
    },
    {
        sequence: 8,
        time: new Date("2026-11-12T18:43:45Z"),
        mode: "FT8",
        band: "15M",
        frequency: 21076100,
        receiverCall: "ZL2BCD",
        distance: 10500000,
        snr: -16,
        senderDXCC: { countryCode: "US" },
        location: { latitude: -36.85, longitude: 174.76 },
    },
    {
        sequence: 9,
        time: new Date("2026-11-12T18:44:00Z"),
        mode: "FT8",
        band: "20M",
        frequency: 14075500,
        receiverCall: "DL1ABC",
        distance: 9120000,
        snr: -22,
        senderDXCC: { countryCode: "US" },
        location: { latitude: 50.11, longitude: 8.68 },
    },
    {
        sequence: 10,
        time: new Date("2026-11-12T18:44:15Z"),
        mode: "FT8",
        band: "10M",
        frequency: 28076240,
        receiverCall: "XE2YY",
        distance: 2500000,
        snr: -9,
        senderDXCC: { countryCode: "US" },
        location: { latitude: 25.69, longitude: -100.32 },
    },
    {
        sequence: 11,
        time: new Date("2026-11-12T18:44:22Z"),
        mode: "FT4",
        band: "17M",
        frequency: 18105200,
        receiverCall: "PY2ABC",
        distance: 10500000,
        snr: -14,
        senderDXCC: { countryCode: "US" },
        location: { latitude: -23.55, longitude: -46.63 },
    },
    {
        sequence: 12,
        time: new Date("2026-11-12T18:44:30Z"),
        mode: "FT8",
        band: "20M",
        frequency: 14078200,
        receiverCall: "G4ABC",
        distance: 8600000,
        snr: -23,
        senderDXCC: { countryCode: "US" },
        location: { latitude: 51.51, longitude: -0.13 },
    },
    {
        sequence: 13,
        time: new Date("2026-11-12T18:44:45Z"),
        mode: "FT8",
        band: "20M",
        frequency: 14074680,
        receiverCall: "KL7ABC",
        distance: 3200000,
        snr: -6,
        senderDXCC: { countryCode: "US" },
        location: { latitude: 61.22, longitude: -149.9 },
    },
    {
        sequence: 14,
        time: new Date("2026-11-12T18:45:00Z"),
        mode: "FT8",
        band: "20M",
        frequency: 14076020,
        receiverCall: "AC0DEN",
        distance: 1550000,
        snr: 2,
        senderDXCC: { countryCode: "US" },
        location: { latitude: 39.74, longitude: -104.99 },
    },
    {
        sequence: 15,
        time: new Date("2026-11-12T18:45:07Z"),
        mode: "FT4",
        band: "20M",
        frequency: 14080900,
        receiverCall: "W6DEF",
        distance: 140000,
        snr: 8,
        senderDXCC: { countryCode: "US" },
        location: { latitude: 38.58, longitude: -121.49 },
    },
];
