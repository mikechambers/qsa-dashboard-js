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

import { DisplayMode } from "@/enums/DisplayMode";
import { Platform } from "@/enums/Platform";
import { PLATFORM } from "@/utils/platform";

//returns the map style for the platform and light / dark mode.
//Web: a hosted style URL. Desktop: a style object that only uses local files.
export async function getMapStyle(displayMode) {
    const theme = displayMode === DisplayMode.DARK ? "dark" : "light";

    if (PLATFORM !== Platform.DESKTOP) {
        return `https://styles.maptoolkit.org/${theme}.json`;
    }

    //dynamic import, so the web version never downloads the offline map code
    const { getDesktopMapStyle } = await import("./desktopMapStyle");
    return getDesktopMapStyle(theme);
}
