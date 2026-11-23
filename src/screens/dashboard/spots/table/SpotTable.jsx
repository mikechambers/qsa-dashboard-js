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
import { IconChevronRight, IconInbox, IconTrash } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { useSpotData } from "@/contexts/SpotDataContext";
import { CallsignCell } from "./CallsignCell";

export const SpotTable = ({ onCollapse }) => {
    const { filteredSpots, filter, clearSpots } = useSpotData();

    const spots = filteredSpots;
    const totalSpots = spots.length;
    const hoverSelect = useRef(false);

    const { selectedSpot, setSelectedSpot, focusSpot } = useSelectedSpot();

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

    //keep the latest values in refs so the effect below only has to run when
    //the selection changes. If it also ran on scroll (range) or new spots, it
    //would yank the table back to the selected row whenever it was off screen,
    //so you could never scroll away from it (or back to the top).
    const spotsRef = useRef(spots);
    const virtualizerRef = useRef(virtualizer);
    spotsRef.current = spots;
    virtualizerRef.current = virtualizer;

    const selectedSequence = selectedSpot?.sequence;

    useEffect(() => {
        if (selectedSequence == null) return;
        if (hoverSelect.current) {
            hoverSelect.current = false;
            return;
        }

        const index = spotsRef.current.findIndex(
            (s) => s.sequence === selectedSequence,
        );
        if (index < 0) return;

        const v = virtualizerRef.current;
        const range = v.range;
        const visible =
            range && index >= range.startIndex && index <= range.endIndex;
        if (!visible) v.scrollToIndex(index, { align: "start" });
    }, [selectedSequence]);

    const virtualItems = virtualizer.getVirtualItems();

    const paddingTop = virtualItems.length ? virtualItems[0].start : 0;
    const paddingBottom = virtualItems.length
        ? virtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
        : 0;

    const count = spots ? spots.length : 0;

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
                        {totalSpots} {totalSpots === 1 ? "spot" : "spots"}
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
                    {onCollapse && (
                        <ActionIcon
                            variant="default"
                            size="sm"
                            title="Collapse spots table"
                            aria-label="Collapse spots table"
                            onClick={onCollapse}
                        >
                            <IconChevronRight size={16} />
                        </ActionIcon>
                    )}
                </Group>
            </Group>
            {!spots || !spots.length ? (
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
            ) : (
                <Table.ScrollContainer
                    minWidth={380}
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
                        horizontalSpacing={8}
                        highlightOnHoverColor="var(--mantine-primary-color-light)"
                    >
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Station</Table.Th>

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
                                        style={{
                                            scrollMarginTop: 40,
                                            cursor: "pointer",
                                        }}
                                        onClick={() => focusSpot(spot)}
                                        id={`spot-row-${spot.id}`}
                                        key={spot.sequence}
                                        onMouseEnter={() => {
                                            hoverSelect.current = true;
                                            setSelectedSpot(spot);
                                        }}
                                    >
                                        <Table.Td w={20}>
                                            <CallsignCell
                                                callsign={spot.receiverCall}
                                            />
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
            )}
        </Paper>
    );
};
