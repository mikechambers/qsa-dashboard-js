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

import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import { useSettings } from "@/contexts/SettingsContext";
import { Platform } from "@/enums/Platform";
import { getMenuState, MENU_PATHS } from "@/utils/menu";
import { PLATFORM } from "@/utils/platform";

//connects the desktop app's native menu to the screens. Does nothing on the web
export const useDesktopMenu = () => {
    const { pathname } = useLocation();
    const { settings } = useSettings();

    //navigate changes with the location, and we only want to listen once
    const navigate = useNavigate();
    const navigateRef = useRef(navigate);
    useEffect(() => {
        navigateRef.current = navigate;
    }, [navigate]);

    useEffect(() => {
        if (PLATFORM !== Platform.DESKTOP) return;

        const listening = listen("menu-navigate", ({ payload }) => {
            const path = MENU_PATHS[payload];
            if (path) navigateRef.current(path);
        });

        return () => {
            listening.then((unlisten) => unlisten());
        };
    }, []);

    const {
        dashboard,
        settings: settingsItem,
        about,
    } = getMenuState(pathname, settings.callsign);

    useEffect(() => {
        if (PLATFORM !== Platform.DESKTOP) return;

        invoke("set_menu_state", {
            dashboard,
            settings: settingsItem,
            about,
        }).catch((error) => console.error("Could not update menu", error));
    }, [dashboard, settingsItem, about]);
};
