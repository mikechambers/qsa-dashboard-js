import { Fragment } from "react";
import { Title, Text, Stack, Anchor, Group, Button, List } from "@mantine/core";

import screenClasses from "../screens.module.css";
import { useNavigate } from "react-router";
import { DASHBOARD_PATH } from "@/consts/config";
import { APP_VERSION, BUILD_DATE } from "@/consts";

const ExternalLink = ({ href, children }) => (
    <Anchor href={href} target="_blank" rel="noopener noreferrer">
        {children}
    </Anchor>
);

const FOLLOW_LINKS = [
    { label: "Github", href: "https://github.com/mikechambers/" },
    { label: "X.com", href: "https://x.com/mesh/" },
    { label: "Threads", href: "https://www.threads.com/@mesh2325" },
];

export const AboutScreen = () => {
    const navigate = useNavigate();

    const onDashboardClick = () => {
        navigate(DASHBOARD_PATH);
    };
    return (
        <div
            className={`${screenClasses.centerScreen} ${screenClasses.screen}`}
        >
            <Stack w="100%" maw={640}>
                <Group>
                    <Button
                        variant="subtle"
                        size="compact-sm"
                        onClick={onDashboardClick}
                    >
                        ← Back to dashboard
                    </Button>
                </Group>
                <Title>QSA Dashboard</Title>

                <Text>
                    QSA Dashboard (qsa-dashboard-js) created by{" "}
                    <ExternalLink href="https://www.mikechambers.com">
                        Mike Chambers
                    </ExternalLink>{" "}
                    (W6MSH).
                </Text>
                <Text>
                    Source code is released under an MIT open source license and
                    is available on{" "}
                    <ExternalLink href="https://github.com/mikechambers/qsa-dashboard-js">
                        GitHub
                    </ExternalLink>
                    .
                </Text>
                <Text>
                    You can find a list of other projects by Mike on his{" "}
                    <ExternalLink href="https://www.mikechambers.com/blog/about/">
                        website
                    </ExternalLink>{" "}
                    and follow him on{" "}
                    {FOLLOW_LINKS.map(({ label, href }, i) => (
                        <Fragment key={href}>
                            {i > 0 &&
                                (i === FOLLOW_LINKS.length - 1
                                    ? " and "
                                    : ", ")}
                            <ExternalLink href={href}>{label}</ExternalLink>
                        </Fragment>
                    ))}
                    .
                </Text>

                <Title order={2}>Acknowledgements</Title>

                <Text>
                    Spot data comes from the{" "}
                    <ExternalLink href="https://www.mqtt.pskreporter.info/">
                        PSK Reporter MQTT feed
                    </ExternalLink>
                    , run by Tom M0LTE. The spots themselves come from Philip
                    Gladstone's{" "}
                    <ExternalLink href="https://pskreporter.info">
                        pskreporter.info
                    </ExternalLink>{" "}
                    and are used with permission. Thanks also to everyone who
                    runs a receiving station and reports spots.
                </Text>

                <List>
                    <List.Item>
                        Map styles by{" "}
                        <ExternalLink href="https://maptoolkit.net">
                            Maptoolkit
                        </ExternalLink>
                        , with map data ©{" "}
                        <ExternalLink href="https://www.openstreetmap.org/copyright">
                            OpenStreetMap
                        </ExternalLink>{" "}
                        contributors.
                    </List.Item>
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
                        <ExternalLink href="https://github.com/ham2k">
                            Ham2K
                        </ExternalLink>{" "}
                        libraries for grid square, distance and DXCC data.
                    </List.Item>
                    <List.Item>
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

                <Title order={2}>Bugs and feature requests</Title>
                <Text>
                    Found a bug or have an idea? Let me know on{" "}
                    <ExternalLink href="https://github.com/mikechambers/qsa-dashboard-js">
                        GitHub
                    </ExternalLink>
                    .
                </Text>

                <Text size="xs" c="dimmed">
                    Version {APP_VERSION} ({BUILD_DATE})
                </Text>
            </Stack>
        </div>
    );
};
