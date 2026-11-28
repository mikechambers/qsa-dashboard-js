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

import { StrictMode, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import App from "./App";
import { ABOUT_PATH, DASHBOARD_PATH, SETTINGS_PATH } from "@/consts/config";
import { Platform } from "@/enums/Platform";
import { PLATFORM } from "@/utils/platform";
import { blockContextMenu } from "@/utils/contextMenu";
import { AboutScreen } from "@/screens/about/AboutScreen";

//loaded on first visit, so their code stays out of the initial bundle
const ConfigScreen = lazy(() => import("@/screens/config/ConfigScreen"));
const DashboardScreen = lazy(
    () => import("@/screens/dashboard/DashboardScreen"),
);

//the desktop app opens on the dashboard (which goes to settings if there is
//no callsign yet). The web version opens on About
const START_PATH = PLATFORM === Platform.DESKTOP ? DASHBOARD_PATH : ABOUT_PATH;

//left on in dev, for Inspect Element, and on the web
if (PLATFORM === Platform.DESKTOP && !import.meta.env.DEV) {
    blockContextMenu(window);
}

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />}>
                    <Route
                        index
                        element={<Navigate to={START_PATH} replace />}
                    />
                    <Route path={SETTINGS_PATH} element={<ConfigScreen />} />
                    <Route path={ABOUT_PATH} element={<AboutScreen />} />
                    <Route
                        path={`${DASHBOARD_PATH}/:callsign?/:grid?`}
                        element={<DashboardScreen />}
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </StrictMode>,
);
