import { Paper, Table, Title, Group, Text, EmptyState } from "@mantine/core";
import { useEffect, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { BandFrequencyView } from "./BandFrequencyView";
import { TimeView } from "./TimeView";
import { SNRView } from "./SNRView";
import { DistanceView } from "./DistanceView";
import { useSettings } from "../../context/SettingsContext";
import { getShortTimeZoneName } from "../../utils/date";
import { useSelectedSpot } from "../../context/SelectedSpotContext";

export const SpotTable = ({ spots }) => {
    const { selectedSpot, setSelectedSpot } = useSelectedSpot();

    const [scrollParent, setScrollParent] = useState(null);

    const { settings } = useSettings();

    let timeZone = getShortTimeZoneName(settings.timeMode);

    useEffect(() => {
        if (selectedSpot == null) return;
        document
            .getElementById(`spot-row-${selectedSpot.id}`)
            ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, [selectedSpot]);

    const virtualizer = useVirtualizer({
        count: spots.length,
        getScrollElement: () => scrollParent,

        //todo: need to calculate this
        estimateSize: () => 60,
        overscan: 20,
        getItemKey: (index) => spots[index].sequence,
    });

    const virtualItems = virtualizer.getVirtualItems();

    const count = spots ? spots.length : 0;

    if (!spots || !spots.length) {
        return (
            <Paper p={0}>
                <EmptyState
                    icon={<IconInbox size={40} stroke={1.5} />}
                    title="No spots yet"
                    description="Spots will appear here as they come in."
                />
            </Paper>
        );
    }

    return (
        <Paper
            p={0}
            style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                minHeight: 0,
            }}
        >
            <Group
                p="sm"
                gap="sm"
                justify="space-between"
                style={{ flex: "none" }}
            >
                <Title order={3}>Spots</Title>

                <Text
                    size="sm"
                    c="dimmed"
                    fw={500}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {count} {count === 1 ? "spot" : "spots"}
                </Text>
            </Group>
            <Table.ScrollContainer
                minWidth={418}
                maxHeight="100%"
                style={{ flex: 1, minHeight: 0 }}
                scrollAreaProps={{ viewportRef: setScrollParent }}
            >
                <Table
                    styles={{ td: { verticalAlign: "top" } }}
                    stickyHeader
                    highlightOnHover
                    withTableBorder
                    withRowBorders={true}
                    verticalSpacing="xs"
                    horizontalSpacing="md"
                    highlightOnHoverColor="var(--mantine-primary-color-light)"
                >
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>{timeZone}</Table.Th>

                            <Table.Th ta="left">Loc</Table.Th>
                            <Table.Th ta="right">Distance</Table.Th>
                            <Table.Th ta="right">SNR</Table.Th>

                            <Table.Th ta="center">Band</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {virtualItems.map((virtualRow) => {
                            const spot = spots[virtualRow.index];
                            return (
                                <Table.Tr
                                    bg={
                                        selectedSpot === spot
                                            ? "var(--mantine-color-blue-light)"
                                            : undefined
                                    }
                                    style={{ scrollMarginTop: 40 }}
                                    id={`spot-row-${spot.id}`}
                                    key={spot.sequence}
                                    onMouseEnter={() => setSelectedSpot(spot)}
                                >
                                    <Table.Td w={20}>
                                        <TimeView date={spot.date} />
                                    </Table.Td>
                                    <Table.Td ta="left">
                                        <Text size="sm">
                                            {spot.senderDXCC?.countryCode?.toUpperCase()}
                                        </Text>
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
