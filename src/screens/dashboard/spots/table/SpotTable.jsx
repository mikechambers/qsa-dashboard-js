import {
    Paper,
    Table,
    Title,
    Group,
    Text,
    EmptyState,
    ActionIcon,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { BandFrequencyView } from "./BandFrequencyCell";
import { TimeCell } from "./TimeCell";
import { SNRCell } from "./SNRCell";
import { DistanceCell } from "./DistanceCell";
import { useSettings } from "@/contexts/SettingsContext";
import { getShortTimeZoneName } from "@/utils/date";
import { useSelectedSpot } from "@/contexts/SelectedSpotContext";
import { IconInbox, IconTrash } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { useSpotData } from "@/contexts/SpotDataContext";

export const SpotTable = () => {
    const { filteredSpots, filter, clearSpots } = useSpotData();

    const spots = filteredSpots;
    const totalSpots = spots.length;
    const hoverSelect = useRef(false);

    const { selectedSpot, setSelectedSpot } = useSelectedSpot();

    const [scrollParent, setScrollParent] = useState(null);

    const { settings } = useSettings();

    const onDeleteSpots = () =>
        modals.openConfirmModal({
            title: "Delete All Spots",
            centered: true,
            confirmProps: { color: "red" },
            children: (
                <Text size="sm">
                    Are you sure you want to delete all spots? This action
                    cannot be undone.
                </Text>
            ),
            labels: { confirm: "Delete Spots", cancel: "Cancel" },
            onConfirm: clearSpots,
        });

    let timeZone = getShortTimeZoneName(settings.timeMode);

    const virtualizer = useVirtualizer({
        count: spots.length,
        getScrollElement: () => scrollParent,

        //todo: need to calculate this
        estimateSize: () => 60,
        overscan: 20,
        getItemKey: (index) => spots[index].sequence,
    });

    useEffect(() => {
        if (selectedSpot == null) return;
        if (hoverSelect.current) {
            hoverSelect.current = false;
            return;
        }

        const index = spots.findIndex(
            (s) => s.sequence === selectedSpot.sequence,
        );
        if (index < 0) return;

        const range = virtualizer.range;
        const visible =
            range && index >= range.startIndex && index <= range.endIndex;
        if (!visible) virtualizer.scrollToIndex(index, { align: "start" });
    }, [selectedSpot, spots, virtualizer, virtualizer?.range]);

    const virtualItems = virtualizer.getVirtualItems();

    const paddingTop = virtualItems.length ? virtualItems[0].start : 0;
    const paddingBottom = virtualItems.length
        ? virtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
        : 0;

    const count = spots ? spots.length : 0;

    if (!spots || !spots.length) {
        return (
            <Paper
                p={0}
                justify="center"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    minHeight: 0,
                    justifyContent: "center", // vertical, since the direction is column
                    alignItems: "center", // horizontal
                }}
            >
                <EmptyState
                    icon={<IconInbox size={40} stroke={1.5} />}
                    title={
                        filter.hasFilter()
                            ? "No Spots Match Filter"
                            : "No spots yet"
                    }
                    description={
                        filter.hasFilter()
                            ? ""
                            : "Spots will appear here as they arrive."
                    }
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

                <Group>
                    <Text
                        size="sm"
                        c="dimmed"
                        fw={500}
                        style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                        {count} of {totalSpots}{" "}
                        {totalSpots === 1 ? "spot" : "spots"}
                    </Text>
                    <ActionIcon
                        variant="subtle"
                        size="xs"
                        color="red"
                        title="Delete all spots."
                        onClick={onDeleteSpots}
                    >
                        <IconTrash />
                    </ActionIcon>
                </Group>
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
                        {paddingTop > 0 && (
                            <Table.Tr>
                                <Table.Td
                                    colSpan={5}
                                    style={{
                                        height: paddingTop,
                                        padding: 0,
                                        border: 0,
                                    }}
                                />
                            </Table.Tr>
                        )}
                        {virtualItems.map((virtualRow) => {
                            const spot = spots[virtualRow.index];
                            return (
                                <Table.Tr
                                    ref={virtualizer.measureElement}
                                    data-index={virtualRow.index}
                                    bg={
                                        selectedSpot === spot
                                            ? "var(--mantine-color-blue-light)"
                                            : undefined
                                    }
                                    style={{ scrollMarginTop: 40 }}
                                    id={`spot-row-${spot.id}`}
                                    key={spot.sequence}
                                    onMouseEnter={() => {
                                        hoverSelect.current = true;
                                        setSelectedSpot(spot);
                                    }}
                                >
                                    <Table.Td w={20}>
                                        <TimeCell date={spot.date} />
                                    </Table.Td>
                                    <Table.Td ta="left">
                                        <Text size="sm">
                                            {spot.receiverDXCC?.countryCode?.toUpperCase()}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td ta="right">
                                        <DistanceCell
                                            distance={spot.distance}
                                        />
                                    </Table.Td>

                                    <Table.Td ta="right">
                                        <SNRCell snr={spot.snr} />
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
                        {paddingBottom > 0 && (
                            <Table.Tr>
                                <Table.Td
                                    colSpan={5}
                                    style={{
                                        height: paddingBottom,
                                        padding: 0,
                                        border: 0,
                                    }}
                                />
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </Table.ScrollContainer>
        </Paper>
    );
};
