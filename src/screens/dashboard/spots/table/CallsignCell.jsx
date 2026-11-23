import { Text } from "@mantine/core";
import { CallsignField } from "../detail/CallsignField";

export const CallsignCell = ({ callsign }) => {
    return <CallsignField callsign={callsign} size="sm" />;
};
