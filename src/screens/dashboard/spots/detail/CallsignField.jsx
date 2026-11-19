import { Text } from "@mantine/core";
import { normalizeCallsign } from "@/utils/radio";

export const CallsignField = ({ callsign }) => {
    const c = normalizeCallsign(callsign);

    return (
        <Text fx="lg" fw={600}>
            {c}
        </Text>
    );
};
