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
export const SETTINGS_PATH = "/settings";
export const ABOUT_PATH = "/about";
export const DASHBOARD_PATH = "/dashboard";
export const MIN_SNR = -30;
export const MAX_SNR = 10;
export const SETTINGS_NAMESPACE = "qsa.setting";

export const MAP_DISTANCE_RING_PALETTE = {
    LIGHT: {
        ring: "#495057",
        ringOpacity: 0.5,
        furthest: "#1fa393",
        furthestOpacity: 0.6,
        label: "#495057",
    },
    DARK: {
        ring: "#adb5bd",
        ringOpacity: 0.5,
        furthest: "#45c4ae",
        furthestOpacity: 0.5,
        label: "#f1f3f5",
    },
};
