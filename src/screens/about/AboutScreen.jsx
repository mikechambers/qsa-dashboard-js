import { Fragment } from "react";
import {
    Title,
    Text,
    Stack,
    Anchor,
    Group,
    List,
    Divider,
} from "@mantine/core";

import "@mantine/lightbox/styles.css";
import { useState } from "react";
import { Image, SimpleGrid } from "@mantine/core";
import { Lightbox } from "@mantine/lightbox";

import screenClasses from "../screens.module.css";
import NavBar from "../nav/NavBar";
import { APP_VERSION, BUILD_DATE } from "@/consts";
import SCREENSHOT_EXPANDED from "@/assets/screenshot-expanded.png";
import SCREENSHOT_EXPANDED_THUMB from "@/assets/screenshot-expanded-thumb.webp";
import SCREENSHOT_DARK from "@/assets/screenshot-dark.png";
import SCREENSHOT_DARK_THUMB from "@/assets/screenshot-dark-thumb.webp";
import SCREENSHOT_FILTERS from "@/assets/screenshot-filters.png";
import SCREENSHOT_FILTERS_THUMB from "@/assets/screenshot-filters-thumb.webp";
import { ThirdPartyLicenses } from "./ThirdPartyLicenses";

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
    const [opened, setOpened] = useState(false);
    const [index, setIndex] = useState(0);
    const slides = [
        {
            src: SCREENSHOT_EXPANDED,
            thumb: SCREENSHOT_EXPANDED_THUMB,
            alt: "All Modules Expanded",
            caption: "All Modules Expanded",
        },
        {
            src: SCREENSHOT_DARK,
            thumb: SCREENSHOT_DARK_THUMB,
            alt: "Dark Mode",
            caption: "Dark Mode",
        },
        {
            src: SCREENSHOT_FILTERS,
            thumb: SCREENSHOT_FILTERS_THUMB,
            alt: "Filters",
            caption: "Filters Enabled",
        },
    ];
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
                        QSA Dashboard is a cross-platform desktop and web based
                        dashboard created by{" "}
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

                    <Group>
                        <Lightbox
                            opened={opened}
                            onClose={() => setOpened(false)}
                            slides={slides}
                            currentIndex={index}
                            onIndexChange={setIndex}
                        />

                        <SimpleGrid cols={3}>
                            {slides.map((slide, i) => (
                                <Image
                                    key={slide.src}
                                    src={slide.thumb}
                                    alt={slide.alt}
                                    radius="md"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        setIndex(i);
                                        setOpened(true);
                                    }}
                                />
                            ))}
                        </SimpleGrid>
                    </Group>
                </Stack>

                <Section title="Acknowledgements">
                    <Text>
                        Spot data comes from the{" "}
                        <ExternalLink href="https://www.mqtt.pskreporter.info/">
                            PSK Reporter MQTT feed
                        </ExternalLink>
                        , run by Tom Fanning (M0LTE). The spots themselves come
                        from Philip Gladstone's{" "}
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
                            Web map styles by{" "}
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
                            Callsign country data from{" "}
                            <ExternalLink href="https://www.country-files.com">
                                Amateur Radio Country Files
                            </ExternalLink>{" "}
                            by Jim Reisert (AD1C), via the Ham2K library.
                        </List.Item>
                        <List.Item>
                            Heard and CQ stations come from{" "}
                            <ExternalLink href="https://wsjt.sourceforge.io">
                                WSJT-X
                            </ExternalLink>
                            , by Joe Taylor (K1JT) and the WSJT development
                            team.
                        </List.Item>
                        <List.Item>
                            Desktop app built with{" "}
                            <ExternalLink href="https://tauri.app">
                                Tauri
                            </ExternalLink>
                            . Its offline map is from{" "}
                            <ExternalLink href="https://protomaps.com">
                                Protomaps
                            </ExternalLink>
                            , read with{" "}
                            <ExternalLink href="https://github.com/protomaps/PMTiles">
                                PMTiles
                            </ExternalLink>
                            , with data from{" "}
                            <ExternalLink href="https://www.openstreetmap.org/copyright">
                                OpenStreetMap
                            </ExternalLink>{" "}
                            contributors and{" "}
                            <ExternalLink href="https://www.naturalearthdata.com">
                                Natural Earth
                            </ExternalLink>
                            , icons from{" "}
                            <ExternalLink href="https://github.com/tangrams/icons">
                                Tangram
                            </ExternalLink>{" "}
                            and labels in Noto Sans.
                        </List.Item>
                        <List.Item>
                            <ExternalLink href="https://tabler.io/icons">
                                Tabler Icons
                            </ExternalLink>{" "}
                            and the{" "}
                            <ExternalLink href="https://github.com/googlefonts/RobotoMono">
                                Roboto Mono
                            </ExternalLink>{" "}
                            font.
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
                            </ExternalLink>
                            ,{" "}
                            <ExternalLink href="https://reactrouter.com">
                                React Router
                            </ExternalLink>
                            ,{" "}
                            <ExternalLink href="https://recharts.org">
                                Recharts
                            </ExternalLink>
                            ,{" "}
                            <ExternalLink href="https://tanstack.com/virtual">
                                TanStack Virtual
                            </ExternalLink>
                            ,{" "}
                            <ExternalLink href="https://www.embla-carousel.com">
                                Embla Carousel
                            </ExternalLink>{" "}
                            and{" "}
                            <ExternalLink href="https://vite.dev">
                                Vite
                            </ExternalLink>
                            .
                        </List.Item>
                    </List>

                    <Text>
                        <ThirdPartyLicenses />
                    </Text>
                </Section>

                <Section title="Bugs and feature requests">
                    <Text>
                        Found a bug or have an idea? Share it on{" "}
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
