import { useSpotData } from "@/contexts/SpotDataContext";
import { Badge, Box } from "@mantine/core";
import { ConnectionStatus } from "../../../enums/ConnectionStatus";

const STATUS_STYLES = {
    [ConnectionStatus.CONNECTED]: { color: "green", label: "Connected" },
    [ConnectionStatus.CONNECTING]: { color: "yellow", label: "Connecting" },
    [ConnectionStatus.DISCONNECTED]: { color: "red", label: "Disconnected" },
};

export const ConnectionStatusView = () => {
    const { status } = useSpotData();

    const { color, label } = STATUS_STYLES[status];

    return (
        <Badge
            variant="light"
            color={color}
            size="lg"
            tt="none"
            leftSection={
                <Box w={8} h={8} bg={color} style={{ borderRadius: "50%" }} />
            }
        >
            {label}
        </Badge>
    );
};
