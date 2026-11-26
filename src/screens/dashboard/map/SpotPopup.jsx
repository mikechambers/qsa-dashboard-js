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

import { ActionIcon, Group, Text } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

import { useSettings } from "@/contexts/SettingsContext";
import { useSpotData } from "@/contexts/SpotDataContext";
import { useWsjtx } from "@/contexts/WsjtxContext";
import { StationType } from "@/enums/StationType";
import { useActiveStations } from "@/hooks/useActiveStations";
import { getTheyHearYou, getYouHearThem } from "@/utils/signalReports";
import {
    convertAndFormatDistance,
    formatFrequency,
    formatTime,
} from "@/utils/view";
import { spotRow, stationRow } from "@/utils/tableRows";
import { getShortTimeZoneName, timeAgo } from "@/utils/date";

import { ReplyButton } from "./ReplyButton";
import { StationCard } from "./StationCard";

import classes from "./SpotPopup.module.css";

const formatDetails = (grid, dxcc) =>
    [
        grid,
        dxcc?.ituZone != null && `ITU ${dxcc.ituZone}`,
        dxcc?.cqZone != null && `CQ ${dxcc.cqZone}`,
    ]
        .filter(Boolean)
        .join(" · ");

const formatClock = (date, timeMode) =>
    `${formatTime(date, timeMode)} ${getShortTimeZoneName(timeMode)}`;

const formatWhen = (date, timeMode) => {
    const time = formatClock(date, timeMode);
    const ago = timeAgo(date);

    return ago ? `${time} · ${ago}` : time;
};

//where the report of our signal came from, and how old it is
const reportNote = (report) => {
    if (!report) return "No report of your signal yet";

    const source =
        report.source === "message" ? "their message" : "PSK Reporter";

    return `Their report of you: ${source}, ${timeAgo(report.date)}`;
};

//what a station heard by WSJT-X is doing, for the top of its card
const describeStation = ({ decode, callingYou, working }, myCall) => {
    if (working) return "Working them";
    if (callingYou) return "Calling you";
    if (myCall && decode.toCall === myCall) return "To you";
    if (decode.toCall) return `To ${decode.toCall}`;

    //CQs have their own phrase
};

//what the card shows the same way for every row (see tableRows)
const cardProps = (row, unitType) => ({
    type: row.type,
    call: row.call,
    country: row.dxcc?.shortName,
    mode: row.mode,
    band: row.band,
    distance:
        row.distance !== undefined
            ? convertAndFormatDistance(row.distance, unitType)
            : undefined,
    //"" for a row with no frequency, which the card leaves off
    frequency: formatFrequency(row.frequency),
    details: formatDetails(row.location?.grid, row.dxcc),
});

//card for a station heard by WSJT-X
const HeardStation = ({ station, onUnpin, open, toggle }) => {
    const { settings } = useSettings();
    const { spots } = useSpotData();
    const { decodes, status } = useWsjtx();
    const { decode } = station;
    const row = stationRow(station);

    const theyHearYou = getTheyHearYou({
        call: row.call,
        band: row.band,
        decodes,
        spots,
        myCall: status?.deCall,
    });

    return (
        <StationCard
            {...cardProps(row, settings.unitType)}
            status={describeStation(station, status?.deCall)}
            typeNote={
                row.type === StationType.CQ ? decode.cqModifier : undefined
            }
            theyHearYou={theyHearYou}
            youHearThem={row.youHearThem}
            time={formatClock(row.date, settings.timeMode)}
            age={timeAgo(row.date)}
            note={reportNote(theyHearYou)}
            //WSJT-X only accepts replies to CQs
            action={
                row.type === StationType.CQ && (
                    <ReplyButton
                        key={decode.call}
                        decode={decode}
                        status={status}
                    />
                )
            }
            onUnpin={onUnpin}
            open={open}
            toggle={toggle}
        />
    );
};

//card for a PSK Reporter spot
const SpotStation = ({ spot, open, toggle }) => {
    const { settings } = useSettings();
    const { available, decodes } = useWsjtx();

    const row = spotRow(spot);

    const youHearThem = getYouHearThem({
        call: row.call,
        band: row.band,
        decodes,
    });

    let note;
    if (available) {
        note = youHearThem
            ? `You decoded them ${timeAgo(youHearThem.date)}`
            : "You haven't decoded them recently";
    }

    return (
        <StationCard
            {...cardProps(row, settings.unitType)}
            theyHearYou={row.theyHearYou}
            youHearThem={youHearThem}
            showYouHear={available}
            time={formatWhen(row.date, settings.timeMode)}
            note={note}
            open={open}
            toggle={toggle}
        />
    );
};

//detail card, always at the top right of the map. Shows the selected spot or
//heard station, and can be collapsed to a single line.
export const SpotPopup = ({
    spot,
    stationCall,
    onUnpin, //set when the heard station is pinned
    open,
    onOpenChange,
}) => {
    const station = useActiveStations().find(
        (s) => s.decode.call === stationCall,
    );

    const toggle = (
        <ActionIcon
            variant="default"
            size="sm"
            aria-label={open ? "Collapse spot details" : "Expand spot details"}
            title={open ? "Collapse" : "Expand"}
            onClick={() => onOpenChange(!open)}
        >
            {open ? (
                <IconChevronUp size={16} />
            ) : (
                <IconChevronDown size={16} />
            )}
        </ActionIcon>
    );

    let content;
    if (station) {
        content = (
            <HeardStation
                station={station}
                onUnpin={onUnpin}
                open={open}
                toggle={toggle}
            />
        );
    } else if (spot) {
        content = <SpotStation spot={spot} open={open} toggle={toggle} />;
    } else {
        //nothing selected yet
        content = (
            <div className={`${classes.card} ${classes.empty}`}>
                <Group justify="space-between" wrap="nowrap">
                    <Text size="sm" c="dimmed">
                        {open
                            ? "Hover or click a spot to see its details"
                            : "Spot details"}
                    </Text>
                    {toggle}
                </Group>
            </div>
        );
    }

    return <div className={classes.popup}>{content}</div>;
};
