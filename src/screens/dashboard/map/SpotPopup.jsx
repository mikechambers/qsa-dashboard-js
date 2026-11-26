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

//card for a station calling CQ or calling us
const CallingStation = ({ station, onUnpin, open, toggle }) => {
    const { settings } = useSettings();
    const { spots } = useSpotData();
    const { decodes, status } = useWsjtx();
    const { type, decode } = station;

    const theyHearYou = getTheyHearYou({
        call: decode.call,
        band: decode.band,
        decodes,
        spots,
        myCall: status?.deCall,
    });

    return (
        <StationCard
            type={type}
            typeNote={type === StationType.CQ ? decode.cqModifier : undefined}
            call={decode.call}
            country={decode.dxcc?.shortName}
            mode={decode.mode}
            band={decode.band}
            distance={
                decode.distance !== undefined
                    ? convertAndFormatDistance(
                          decode.distance,
                          settings.unitType,
                      )
                    : undefined
            }
            //without a band, there is no radio frequency to show
            frequency={
                decode.band ? formatFrequency(decode.frequency) : undefined
            }
            theyHearYou={theyHearYou}
            youHearThem={{ snr: decode.snr, date: decode.receivedAt }}
            details={formatDetails(decode.location?.grid, decode.dxcc)}
            time={formatClock(decode.receivedAt, settings.timeMode)}
            age={timeAgo(decode.receivedAt)}
            note={reportNote(theyHearYou)}
            //WSJT-X only accepts replies to CQs
            action={
                type === StationType.CQ && (
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

    const youHearThem = getYouHearThem({
        call: spot.receiverCall,
        band: spot.band,
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
            type={StationType.SPOT}
            call={spot.receiverCall}
            country={spot.receiverDXCC?.shortName}
            mode={spot.mode}
            band={spot.band}
            distance={convertAndFormatDistance(
                spot.distance,
                settings.unitType,
            )}
            frequency={formatFrequency(spot.frequency)}
            theyHearYou={{ snr: spot.snr, date: spot.date }}
            youHearThem={youHearThem}
            showYouHear={available}
            details={formatDetails(
                spot.receiverLocation?.grid,
                spot.receiverDXCC,
            )}
            time={formatWhen(spot.date, settings.timeMode)}
            note={note}
            open={open}
            toggle={toggle}
        />
    );
};

//detail card, always at the top right of the map. Shows the selected spot or
//calling station, and can be collapsed to a single line.
export const SpotPopup = ({
    spot,
    stationCall,
    onUnpin, //set when the calling station is pinned
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
            <CallingStation
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
