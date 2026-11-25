import { Fragment } from "react";
import {
    Title,
    Text,
    Stack,
    Anchor,
    Group,
    List,
    Divider,
    Image,
} from "@mantine/core";

import screenClasses from "../screens.module.css";
import NavBar from "../nav/NavBar";
import { APP_VERSION, BUILD_DATE } from "@/consts";
import SCREENSHOT from "@/assets/screenshot-expanded.png";
import classes from "./AboutScreen.module.css";

const REPO_URL = "https://github.com/mikechambers/qsa-dashboard-js";
const REPORT_ISSUES_URL =
    "https://github.com/mikechambers/qsa-dashboard-js/issues";

const FOLLOW_LINKS = [
    { label: "Website", href: "https://www.mikechambers.com/blog/about/" },
    { label: "GitHub", href: "https://github.com/mikechambers/" },
    { label: "X / Twitter", href: "https://x.com/mesh/" },
    { label: "Threads", href: "https://www.threads.com/@mesh2325" },
];

const ExternalLink = ({ href, children, ...props }) => (
    <Anchor href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
    </Anchor>
);

const Section = ({ title, children }) => (
    <Stack gap="sm">
        <Text tt="uppercase" fz="xs" fw={700} lts="0.1em" c="dimmed">
            {title}
        </Text>
        <Divider />
        {children}
    </Stack>
);

export const AboutScreen = () => {
    return (
        <div
            className={`${screenClasses.centerScreen} ${screenClasses.screen}`}
        >
            <Stack
                w="100%"
                maw={640}
                gap="xl"
                className={screenClasses.footerPadding}
            >
                <NavBar />

                <Stack gap="xs">
                    <Title order={1} fz={48} fw={800} lh={1.05} lts="-0.02em">
                        QSA Dashboard
                    </Title>

                    <Text fz="xl" c="dimmed" lh={1.4}>
                        Realtime digital signal propagation reporting.
                    </Text>
                </Stack>

                <Stack gap="sm">
                    <Text>
                        QSA Dashboard is a web based dashboard created by{" "}
                        <ExternalLink href="https://www.mikechambers.com">
                            Mike Chambers
                        </ExternalLink>{" "}
                        (W6MSH) for tracking realtime amateur radio signal
                        propagation for digital modes. It provides insight into
                        how your signal is propagating, as well as antenna
                        performance and band conditions for the station you are
                        tracking.
                    </Text>
                    <Text>
                        Source code is available on{" "}
                        <ExternalLink href={REPO_URL}>GitHub</ExternalLink> and
                        is released under an MIT open source license.
                    </Text>
                    <Image
                        className={classes.screenshot}
                        src={SCREENSHOT}
                        alt="Screenshot"
                        radius="md"
                        width="500"
                        height="auto"
                    />
                </Stack>

                <Section title="Acknowledgements">
                    <Text>
                        Spot data comes from the{" "}
                        <ExternalLink href="https://www.mqtt.pskreporter.info/">
                            PSK Reporter MQTT feed
                        </ExternalLink>
                        , run by Tom M0LTE. The spots themselves come from
                        Philip Gladstone's{" "}
                        <ExternalLink href="https://pskreporter.info">
                            pskreporter.info
                        </ExternalLink>
                        .
                    </Text>

                    <List>
                        <List.Item>
                            <ExternalLink href="https://maplibre.org">
                                MapLibre GL JS
                            </ExternalLink>{" "}
                            for the map, and{" "}
                            <ExternalLink href="https://turfjs.org">
                                Turf.js
                            </ExternalLink>{" "}
                            for great-circle paths and distance rings.
                        </List.Item>
                        <List.Item>
                            Map styles by{" "}
                            <ExternalLink href="https://maptoolkit.net">
                                Maptoolkit
                            </ExternalLink>
                            , with map data from{" "}
                            <ExternalLink href="https://www.openstreetmap.org/copyright">
                                OpenStreetMap
                            </ExternalLink>{" "}
                            contributors.
                        </List.Item>

                        <List.Item>
                            <ExternalLink href="https://github.com/ham2k">
                                Ham2K
                            </ExternalLink>{" "}
                            libraries for grid square, distance and DXCC data.
                        </List.Item>
                        <List.Item>
                            App built with{" "}
                            <ExternalLink href="https://mantine.dev">
                                Mantine
                            </ExternalLink>
                            ,{" "}
                            <ExternalLink href="https://github.com/mqttjs/MQTT.js">
                                MQTT.js
                            </ExternalLink>
                            ,{" "}
                            <ExternalLink href="https://react.dev">
                                React
                            </ExternalLink>{" "}
                            and{" "}
                            <ExternalLink href="https://vite.dev">
                                Vite
                            </ExternalLink>
                            .
                        </List.Item>
                    </List>
                </Section>

                <Section title="Bugs and feature requests">
                    <Text>
                        Found a bug or have an idea? Let me know on{" "}
                        <ExternalLink href={REPORT_ISSUES_URL}>
                            the GitHub project page
                        </ExternalLink>
                        .
                    </Text>
                </Section>

                <Section title="Follow">
                    <Group gap="xs">
                        {FOLLOW_LINKS.map(({ label, href }, index) => (
                            <Fragment key={href}>
                                <ExternalLink href={href} fw={500}>
                                    {label}
                                </ExternalLink>

                                {index !== FOLLOW_LINKS.length - 1 && (
                                    <Text c="dimmed">|</Text>
                                )}
                            </Fragment>
                        ))}
                    </Group>
                </Section>

                <Text size="xs" c="dimmed" ta="center" ff="monospace">
                    {APP_VERSION} · {BUILD_DATE}
                </Text>
            </Stack>
        </div>
    );
};
