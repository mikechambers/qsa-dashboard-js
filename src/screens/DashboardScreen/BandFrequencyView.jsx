import { Stack } from "@mantine/core";
import { BandView } from "./BandView";
import { FrequencyView } from "./FrequencyView";


export const BandFrequencyView = ({band, frequency}) => {
    return (
        <Stack gap={2} align="flex-end">
            <BandView band={band} />
            <FrequencyView frequency={frequency} />
        </Stack>
    );
} 