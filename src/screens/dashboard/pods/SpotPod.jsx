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

import { MAP_DISTANCE_RING_PALETTE } from "@/consts/config";
import { useSelectedSpot } from "@/contexts/SelectedSpotContext";
import { useSettings } from "@/contexts/SettingsContext";
import { SummaryBase } from "@/screens/dashboard/pods/PodBase";
import { convertAndFormatDistance } from "@/utils/view";

export const SpotPod = ({ spot, title }) => {
    const { setSelectedSpot } = useSelectedSpot();
    const { settings } = useSettings();

    const { d, unit } = spot
        ? convertAndFormatDistance(spot.distance, settings.unitType)
        : {};

    const subvalue = spot?.receiverCall
        ? `${spot?.receiverCall} · ${spot?.receiverDXCC?.countryCode?.toUpperCase()} · ${spot.snr} dB`
        : "";

    //const theme = MAP_DISTANCE_RING_PALETTE[settings.displayMode];

    const onSpotClick = () => {
        setSelectedSpot(spot);
    };

    return (
        <SummaryBase
            label={title}
            value={d}
            unit={unit}
            onClick={onSpotClick}
            swatchColor={undefined}
            subvalue={subvalue}
        />
    );
};
