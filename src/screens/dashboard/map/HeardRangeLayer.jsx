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

import { useEffect } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { useShownStations } from "@/hooks/useStations";
import { convertAndFormatDistance } from "@/utils/view";
import {
    EMPTY_FEATURE_COLLECTION,
    HEARD_LABEL_PATH,
    HEARD_RANGE_PATH,
} from "./config";
import { labelFeature, ringFeature } from "./useDistanceBands";

//the ring at the furthest station heard, of those shown. Draws nothing in the
//web version, as there are no decodes. A separate component so that new
//decodes don't rerender the whole map
export const HeardRangeLayer = ({ map, ready, location }) => {
    const { settings } = useSettings();
    const { unitType } = settings;
    const show = settings.showDistanceOverlay && settings.showMaxDistance;

    const furthestKm = useShownStations().reduce(
        (max, { decode }) => Math.max(max, decode.distance ?? 0),
        0,
    );

    useEffect(() => {
        if (!map || !ready) return;

        const ring = map.getSource(HEARD_RANGE_PATH);
        const label = map.getSource(HEARD_LABEL_PATH);
        if (!ring || !label) return;

        if (!location || !furthestKm || !show) {
            ring.setData(EMPTY_FEATURE_COLLECTION);
            label.setData(EMPTY_FEATURE_COLLECTION);
            return;
        }

        const center = location.coordinates;
        const { d, unit } = convertAndFormatDistance(furthestKm, unitType);

        ring.setData(ringFeature(center, furthestKm, "kilometers"));
        //a negative distance puts the label due west, away from the other
        //rings' labels, which are all due east
        label.setData(labelFeature(center, -furthestKm, `${d} ${unit}`));
    }, [map, ready, location?.id, furthestKm, show, unitType]);

    return null;
};
