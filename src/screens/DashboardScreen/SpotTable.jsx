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
                striped
                highlightOnHover
                withTableBorder
                withRowBorders={false}
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
                                    {spot.senderDXCC.countryCode}
                                </Table.Td>
                                <Table.Td ta="right">
                                    <DistanceView distance={spot.distance} />
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
    },
];
