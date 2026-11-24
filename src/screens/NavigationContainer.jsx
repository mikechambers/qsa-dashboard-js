import { DASHBOARD_PATH, SETTINGS_PATH, ABOUT_PATH } from "@/consts/config";
import { Anchor, Group, Text } from "@mantine/core";
import { Fragment } from "react";
import { Link, useLocation } from "react-router";

const links = [
    { label: "Dashboard", path: DASHBOARD_PATH },
    { label: "Settings", path: SETTINGS_PATH },
    { label: "About", path: ABOUT_PATH },
];

export const NavigationContainer = ({ disableDashboard = false }) => {
    const { pathname } = useLocation();

    return (
        <Group>
            {links.map(({ label, path }, index) => {
                let disabled = pathname === path;
                if (path === DASHBOARD_PATH && disableDashboard) {
                    disabled = true;
                }

                return (
                    <Fragment key={path}>
                        <Anchor
                            component={Link}
                            to={path}
                            underline={disabled ? "never" : undefined}
                            c={disabled ? "dimmed" : undefined}
                            fw={disabled ? 500 : 400}
                            style={{ cursor: disabled ? "default" : "pointer" }}
                        >
                            {label}
                        </Anchor>

                        {index !== links.length - 1 && (
                            <Text c="dimmed">|</Text>
                        )}
                    </Fragment>
                );
            })}
        </Group>
    );
};
