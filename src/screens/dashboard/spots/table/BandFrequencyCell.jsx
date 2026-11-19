import { Stack } from "@mantine/core";
import { BandBadge } from "../BandBadge";
import { FrequencyCell } from "./FrequencyCell";

export const BandFrequencyView = ({ band, frequency }) => {
    return (
        <Stack gap={2} align="flex-end">
            <BandBadge band={band} />
            <FrequencyCell frequency={frequency} />
        </Stack>
    );
};
