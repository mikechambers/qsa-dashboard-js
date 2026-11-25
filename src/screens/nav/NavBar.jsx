import { NavLink, useMatch } from "react-router";
import { Group, Tooltip } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";

import { useSettings } from "@/contexts/SettingsContext";
import { ABOUT_PATH, DASHBOARD_PATH, SETTINGS_PATH } from "@/consts/config";

import classes from "./NavBar.module.css";

//NavLink adds the "active" class and aria-current to the current page
const linkClass = ({ isActive }) =>
    isActive ? `${classes.link} ${classes.active}` : classes.link;

export default function NavBar() {
    const { settings } = useSettings();

    //only lock Dashboard on the settings page. Elsewhere the link works, and
    //the dashboard redirects to settings if there is no callsign
    const onSettings = useMatch(SETTINGS_PATH);
    const dashboardLocked = onSettings && !settings.callsign;

    return (
        <Group component="nav" gap="lg" w="100%" className={classes.nav}>
            {dashboardLocked ? (
                <Tooltip label="Enter station info first">
                    <span
                        role="link"
                        aria-disabled="true"
                        tabIndex={0}
                        className={`${classes.link} ${classes.disabled}`}
                    >
                        <IconLock size={14} aria-hidden="true" />
                        Dashboard
                    </span>
                </Tooltip>
            ) : (
                <NavLink to={DASHBOARD_PATH} className={linkClass}>
                    Dashboard
                </NavLink>
            )}
            <NavLink to={SETTINGS_PATH} className={linkClass}>
                Settings
            </NavLink>
            <NavLink to={ABOUT_PATH} className={linkClass}>
                About
            </NavLink>
        </Group>
    );
}
