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

import { Suspense } from "react";

import "./styles/global.css";
import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";

import { MantineProvider, createTheme } from "@mantine/core";

import { Outlet, useLocation } from "react-router";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext";
import { SpotDataProvider } from "./contexts/SpotDataContext";

//const App = (props) => {

import "@fontsource/roboto-mono/400.css";
import "@fontsource/roboto-mono/500.css";
import "@fontsource/roboto-mono/600.css";
import { DisplayMode } from "./enums/DisplayMode";
import { ModalsProvider } from "@mantine/modals";
import { WsjtxProvider } from "./contexts/WsjtxContext";
import { ActiveStationsProvider } from "./contexts/ActiveStationsContext";
import { useDesktopMenu } from "./hooks/useDesktopMenu";
import { NotificationProvider } from "./contexts/NotificationContext";
import { GridMismatchNotice } from "./screens/notifications/GridMismatchNotice";
import { SecondWsjtxNotice } from "./screens/notifications/SecondWsjtxNotice";
import { ErrorBoundary } from "./screens/ErrorBoundary";

const theme = createTheme({
    fontFamilyMonospace: "'Roboto Mono', monospace, monospace",
    black: "#212529",
    components: {
        Paper: {
            defaultProps: {
                p: "xs",
                radius: "sm",
                withBorder: true,
            },
        },
        Table: {
            styles: {
                th: {
                    fontSize: "var(--mantine-font-size-xs)",
                    fontWeight: 600,
                    color: "var(--mantine-color-dimmed)",
                    paddingBlock: 8,
                },
            },
        },
    },
});

export default function App() {
    return (
        <SettingsProvider>
            <SpotDataProvider>
                <WsjtxProvider>
                    <ActiveStationsProvider>
                        <ThemedApp />
                    </ActiveStationsProvider>
                </WsjtxProvider>
            </SpotDataProvider>
        </SettingsProvider>
    );
}

function ThemedApp() {
    const { settings } = useSettings();
    const { pathname } = useLocation();
    useDesktopMenu();

    const colorScheme =
        settings.displayMode === DisplayMode.DARK ? "dark" : "light";

    return (
        <MantineProvider theme={theme} forceColorScheme={colorScheme}>
            <ModalsProvider>
                <NotificationProvider>
                    <div id="main">
                        <ErrorBoundary resetKey={pathname}>
                            <Suspense fallback={null}>
                                <Outlet />
                            </Suspense>
                        </ErrorBoundary>
                    </div>
                    <GridMismatchNotice />
                    <SecondWsjtxNotice />
                </NotificationProvider>
            </ModalsProvider>
        </MantineProvider>
    );
}
