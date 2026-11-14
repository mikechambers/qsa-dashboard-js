import "./styles/global.css";
import "@mantine/core/styles.css";
import "./App.css";

import { MantineProvider, createTheme } from "@mantine/core";

import { Outlet } from "react-router";
import { SettingsProvider } from "./context/SettingsContext";
import { SpotDataProvider } from "./context/SpotDataContext";

//const App = (props) => {

import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/600.css";

const theme = createTheme({
    fontFamilyMonospace: "'JetBrains Mono', ui-monospace, monospace",
    components: {
        Paper: {
            defaultProps: {
                p: "sm",
                shadow: "xs",
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
        <MantineProvider theme={theme}>
            <div id="main">
                <SettingsProvider>
                    <SpotDataProvider>
                        <Outlet />
                    </SpotDataProvider>
                </SettingsProvider>
            </div>
        </MantineProvider>
    );
}
