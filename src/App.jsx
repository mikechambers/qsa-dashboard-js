import "./styles/global.css";
import "@mantine/core/styles.css";
import "./App.css";

import { MantineProvider, createTheme } from "@mantine/core";

import { Outlet } from "react-router";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import { SpotDataProvider } from "./context/SpotDataContext";

//const App = (props) => {

import "@fontsource/roboto-mono/400.css";
import "@fontsource/roboto-mono/500.css";
import "@fontsource/roboto-mono/600.css";
import { DisplayMode } from "./enums/DisplayMode";
import { useSelection } from "@mantine/hooks";

const theme = createTheme({
    fontFamilyMonospace: "'Roboto Mono', monospace, monospace",
    black: "#212529",
    components: {
        Paper: {
            defaultProps: {
                p: "sm",
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
                <ThemedApp />
            </SpotDataProvider>
        </SettingsProvider>
    );
}

function ThemedApp() {
    const { settings } = useSettings();

    const colorScheme =
        settings.displayMode === DisplayMode.DARK ? "dark" : "light";

    return (
        <MantineProvider theme={theme} forceColorScheme={colorScheme}>
            <div id="main">
                <Outlet />
            </div>
        </MantineProvider>
    );
}
