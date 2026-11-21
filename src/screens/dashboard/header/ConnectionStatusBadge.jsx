import { useSpotData } from "@/contexts/SpotDataContext";
import { Badge, Box, ThemeIcon } from "@mantine/core";
import { ConnectionStatus as CS } from "@/enums/ConnectionStatus";
import {
    IconCloudCheck,
    IconCloudExclamation,
    IconCloudOff,
} from "@tabler/icons-react";

const STATUS_STYLES = {
    [CS.CONNECTED]: {
        color: "green",
        label: "Connected",
        icon: IconCloudCheck,
    },
    [CS.CONNECTING]: {
        color: "yellow",
        label: "Connecting",
        icon: IconCloudExclamation,
    },
    [CS.DISCONNECTED]: {
        color: "red",
        label: "Disconnected",
        icon: IconCloudOff,
    },
};

export const ConnectionStatusBadge = () => {
    const { status } = useSpotData();

    const { color, icon: Icon } = STATUS_STYLES[status];

    return <Icon size={20} color={`var(--mantine-color-${color}-6)`} />;
};
