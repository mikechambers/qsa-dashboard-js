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
import { SNRCell } from "./SNRCell";
import { DistanceCell } from "./DistanceCell";
import { useSettings } from "@/contexts/SettingsContext";
import { useSelectedSpot } from "@/contexts/SelectedSpotContext";
import { IconChevronRight, IconInbox, IconTrash } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { useSpotData } from "@/contexts/SpotDataContext";
import { CallsignCell } from "./CallsignCell";
import { useTypeFilter } from "@/hooks/useTypeFilter";
import { useWsjtx } from "@/contexts/WsjtxContext";
import { useFilteredStations } from "@/hooks/useStations";
import { StationType } from "@/enums/StationType";
import { TableTab } from "@/enums/TableTab";
import { getTheyHearYou } from "@/utils/signalReports";
import {
    getSelectedTab,
    getTabCounts,
    getTabFilter,
    getTableRows,
} from "@/utils/tableRows";
import { TableTabs } from "./TableTabs";
import { TypeLine } from "./TypeLine";

//what to say when there are no rows. tab is undefined for a mix of types
const getEmptyText = (tab, { hidden, filtered }) => {
    if (hidden) {
        return ["Everything Is Hidden", "Set Type to All in the filters."];
    }
    if (filtered) return ["Nothing Matches the Filters", ""];
    if (tab === TableTab.HEARD) {
        return ["No stations heard", "Stations you decode will appear here."];
    }
    if (tab === TableTab.CQ) {
        return ["No CQ calls", "Stations calling CQ will appear here."];
    }
    return ["No spots yet", "Spots will appear here as they arrive."];
};

export const SpotTable = ({ onCollapse }) => {
    const { spots, filteredSpots, filter, clearSpots } = useSpotData();
    const { shownSpots, show, setShow } = useTypeFilter();
    //the row under the mouse
    const hoveredKey = useRef(null);

    const { selectedKey, hover, focus } = useSelectedSpot();

    const [scrollParent, setScrollParent] = useState(null);

    const { settings } = useSettings();

    //only the desktop version hears stations, so the web has just spots
    const { available, decodes, status, clearDecodes } = useWsjtx();
    const stations = useFilteredStations();

    //the tabs are the type filter, so they follow the map buttons and the
    //Type dropdown, and those follow them
    const tab = available ? getSelectedTab(show) : TableTab.SPOTS;
    //the web version only has spots, so the filter doesn't apply
    const rows = getTableRows(
        shownSpots,
        stations,
        available ? show : { [StationType.SPOT]: true },
    );
    const totalSpots = shownSpots.length;

    const [emptyTitle, emptyDescription] = getEmptyText(tab, {
        hidden: available && !Object.values(show).some(Boolean),
        filtered: filter.hasFilter(),
    });

    const onDeleteSpots = () =>
        modals.openConfirmModal({
            title: available ? "Delete All Stations" : "Delete All Spots",
            centered: true,
            confirmProps: { color: "red" },
            children: (
                <Text size="sm">
                    Are you sure you want to delete all{" "}
                    {available ? "spots and heard stations" : "spots"}? This
                    action cannot be undone.
                </Text>
            ),
            labels: { confirm: "Delete", cancel: "Cancel" },
            onConfirm: () => {
                clearSpots();
                clearDecodes();
            },
        });

    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => scrollParent,

        //todo: need to calculate this
        estimateSize: () => 60,
        overscan: 20,
        getItemKey: (index) => rows[index].key,
    });

    //keep the latest values in refs so the effect below only has to run when
    //the selection changes. If it also ran on scroll (range) or new spots, it
    //would yank the table back to the selected row whenever it was off screen,
    //so you could never scroll away from it (or back to the top).
    const rowsRef = useRef(rows);
    const virtualizerRef = useRef(virtualizer);
    rowsRef.current = rows;
    virtualizerRef.current = virtualizer;

    //show the row selected from the map or a pod. Not one selected by hovering
    //it here, as it is already in view
    useEffect(() => {
        if (!selectedKey || hoveredKey.current === selectedKey) return;

        const index = rowsRef.current.findIndex((r) => r.key === selectedKey);
        if (index < 0) return;

        const v = virtualizerRef.current;
        const range = v.range;
        const visible =
            range && index >= range.startIndex && index <= range.endIndex;
        if (!visible) v.scrollToIndex(index, { align: "start" });
    }, [selectedKey]);

    const virtualItems = virtualizer.getVirtualItems();

    const paddingTop = virtualItems.length ? virtualItems[0].start : 0;
    const paddingBottom = virtualItems.length
        ? virtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
        : 0;

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
                <Title order={3}>{available ? "Stations" : "Spots"}</Title>

                <Group>
                    {/* with tabs, each tab has its count */}
                    {!available && (
                        <Text
                            size="sm"
                            c="dimmed"
                            fw={500}
                            style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                            {totalSpots} {totalSpots === 1 ? "spot" : "spots"}
                        </Text>
                    )}
                    <ActionIcon
                        variant="subtle"
                        size="xs"
                        color="red"
                        title={
                            available
                                ? "Delete all spots and heard stations."
                                : "Delete all spots."
                        }
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
            {available && (
                <div style={{ flex: "none", padding: "0 12px 10px" }}>
                    <TableTabs
                        //null leaves every tab unselected
                        value={tab ?? null}
                        onChange={(t) => setShow(getTabFilter(t))}
                        counts={getTabCounts(filteredSpots, stations)}
                    />
                </div>
            )}
            {!rows.length ? (
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
                        title={emptyTitle}
                        description={emptyDescription}
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
                                const row = rows[virtualRow.index];
                                const { spot } = row;
                                const selected = row.key === selectedKey;

                                //how they hear us, for stations calling CQ
                                const report =
                                    row.type === StationType.CQ
                                        ? getTheyHearYou({
                                              call: row.call,
                                              band: row.band,
                                              decodes,
                                              spots,
                                              myCall: status?.deCall,
                                          })
                                        : undefined;

                                const theyHearYou = row.theyHearYou ?? report;

                                return (
                                    <Table.Tr
                                        ref={virtualizer.measureElement}
                                        data-index={virtualRow.index}
                                        bg={
                                            selected
                                                ? "var(--mantine-color-blue-light)"
                                                : undefined
                                        }
                                        style={{
                                            scrollMarginTop: 40,
                                            cursor: "pointer",
                                        }}
                                        onClick={() =>
                                            focus(
                                                row.key,
                                                row.location?.coordinates,
                                            )
                                        }
                                        id={
                                            spot
                                                ? `spot-row-${spot.id}`
                                                : undefined
                                        }
                                        key={row.key}
                                        onMouseEnter={() => {
                                            hoveredKey.current = row.key;
                                            hover(row.key);
                                        }}
                                        onMouseLeave={() => {
                                            hoveredKey.current = null;
                                        }}
                                    >
                                        <Table.Td w={20}>
                                            <CallsignCell callsign={row.call} />
                                            {available && (
                                                <TypeLine
                                                    type={row.type}
                                                    date={row.date}
                                                />
                                            )}
                                        </Table.Td>
                                        <Table.Td ta="left">
                                            <Text size="sm">
                                                {row.countryCode?.toUpperCase()}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td ta="right">
                                            {row.distance !== undefined ? (
                                                <DistanceCell
                                                    distance={row.distance}
                                                />
                                            ) : (
                                                <Text size="sm" c="dimmed">
                                                    —
                                                </Text>
                                            )}
                                        </Table.Td>

                                        <Table.Td ta="right">
                                            {theyHearYou && (
                                                <SNRCell
                                                    snr={theyHearYou.snr}
                                                    arrow={
                                                        available
                                                            ? "↑"
                                                            : undefined
                                                    }
                                                />
                                            )}
                                            {row.youHearThem && (
                                                <SNRCell
                                                    snr={row.youHearThem.snr}
                                                    arrow="↓"
                                                />
                                            )}
                                        </Table.Td>

                                        <Table.Td ta="center">
                                            {row.band && (
                                                <BandFrequencyView
                                                    frequency={row.frequency}
                                                    band={row.band}
                                                />
                                            )}
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
