import { Box } from "@mantine/core";
import { SignalColor } from "@/enums/SignalColors";

export const SNRBar = ({ snr }) => {
    const name = SignalColor.getNameForSNR(snr);
    return (
        <Box
            w={20}
            h={6}
            bg={SignalColor.getColor(name)}
            style={{ borderRadius: 3 }}
            role="img"
        />
    );
};
