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

import { ABOUT_PATH, DASHBOARD_PATH, SETTINGS_PATH } from "@/consts/config";

//where each native menu item goes. The ids come from src-tauri/src/menu.rs
export const MENU_PATHS = {
    dashboard: DASHBOARD_PATH,
    settings: SETTINGS_PATH,
    about: ABOUT_PATH,
};

//which menu items are enabled. The current screen is disabled, and as in the
//nav bar, so is the dashboard on the settings screen until there is a callsign
export const getMenuState = (pathname, callsign) => {
    const on = (path) => pathname.startsWith(path);

    return {
        dashboard: !on(DASHBOARD_PATH) && !(on(SETTINGS_PATH) && !callsign),
        settings: !on(SETTINGS_PATH),
        about: !on(ABOUT_PATH),
    };
};
