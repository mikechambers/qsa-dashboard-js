import { useSpotData } from "@/contexts/SpotDataContext";
import { ConnectionStatus as CS } from "@/enums/ConnectionStatus";
import {
    IconCloudCheck,
    IconCloudExclamation,
    IconCloudX,
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
        icon: IconCloudX,
    },
};

export const ConnectionStatusBadge = () => {
    const { status } = useSpotData();

    const { color, icon: Icon } = STATUS_STYLES[status];

    return <Icon size={28} color={`var(--mantine-color-${color}-6)`} />;
};
