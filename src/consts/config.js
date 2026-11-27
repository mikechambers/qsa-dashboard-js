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

export const ADD_SPOT_JITTER = true;
export const SPOT_BATCH_INTERVAL = 2000;
export const SPOT_LIMIT = 3000;
//how many stations heard by WSJT-X are kept, one for each station and band
export const HEARD_LIMIT = 3000;
//how many of the latest decodes are kept
export const DECODE_LIMIT = 500;
//after this a CQ is shown as Heard, and a station no longer as calling you
export const CQ_EXPIRY_MS = 75_000;
//how often to check what has expired or aged out
export const STATION_REFRESH_MS = 5000;
export const AGE_FILTER_REFRESH_MS = 5000;
//how often the shared clock ticks, which keeps the ages in the table current
export const SECOND_TICK_MS = 1000;
//how often the times in the band tiles are redrawn
export const BANDS_REFRESH_MS = 15_000;
//how often the grey line is redrawn, so it stays in the right place
export const TWILIGHT_REFRESH_MS = 60_000;
//decodes arrive in bursts, so they are added in batches this often
export const WSJTX_BATCH_MS = 500;
//WSJT-X is gone after this long without a message. It sends a heartbeat every
//15 seconds, so this allows for a couple to go missing
export const WSJTX_TIMEOUT_MS = 40_000;
//the choices of the age filter, besides all
export const AGE_FILTER_MINUTES = [5, 15, 30, 60];
export const SETTINGS_PATH = "/settings";
export const ABOUT_PATH = "/about";
export const DASHBOARD_PATH = "/dashboard";
export const MIN_SNR = -30;
export const SETTINGS_NAMESPACE = "qsa.setting";

export const STATUS_ICON_SIZE = 22;

//most bands listed in the collapsed summary bar. The rest are counted in "+N"
export const SUMMARY_BAR_MAX_BANDS = 4;

export const MAP_DISTANCE_RING_PALETTE = {
    LIGHT: {
        ring: "#495057",
        ringOpacity: 0.5,
        furthest: "#1fa393",
        furthestOpacity: 0.6,
        furthestHeard: "#2b7fd4",
        furthestHeardOpacity: 0.6,
        label: "#495057",
    },
    DARK: {
        ring: "#adb5bd",
        ringOpacity: 0.5,
        furthest: "#45c4ae",
        furthestOpacity: 0.5,
        furthestHeard: "#5aa7ee",
        furthestHeardOpacity: 0.5,
        label: "#f1f3f5",
    },
};
