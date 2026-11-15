import { SimpleGrid } from "@mantine/core";
import { SummaryPodView } from "./SummaryPodView";
import { useSpotData } from "../../context/SpotDataContext";
import { formatDistance } from "../../utils/view";
import { useSettings } from "../../context/SettingsContext";

export const SummaryPodsContainerView = () => {
    let { furthestSpot } = useSpotData();
    const { settings } = useSettings();

    //todo:debug
    furthestSpot = { distance: 5000 };

    let distance;
    let u;
    if (!furthestSpot) {
        distance = "-";
    } else {
        const { d, unit } = formatDistance(
            furthestSpot?.distance,
            settings.unitType,
        );
        distance = d;
        u = unit;
    }

    return (
        <div id="summaryPods">
            <SimpleGrid cols={{ base: 2, sm: 4 }}>
                <SummaryPodView label="Furthest" value={distance} unit={u} />
                <SummaryPodView label="Label" value="Value" />
                <SummaryPodView label="Label" value="Value" />
                <SummaryPodView label="Label" value="Value" />
            </SimpleGrid>
        </div>
    );
};
