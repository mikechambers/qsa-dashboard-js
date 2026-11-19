import { useSpotData } from "@/contexts/SpotDataContext";
import { Badge, Box } from "@mantine/core";
import { ConnectionStatus as CS } from "@/enums/ConnectionStatus";

const STATUS_STYLES = {
    [CS.CONNECTED]: { color: "green", label: "Connected" },
    [CS.CONNECTING]: { color: "yellow", label: "Connecting" },
    [CS.DISCONNECTED]: { color: "red", label: "Disconnected" },
};

export const ConnectionStatusBadge = () => {
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
