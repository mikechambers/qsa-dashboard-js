import { SimpleGrid } from "@mantine/core";
import { SummaryPodView } from "./SummaryPodView";
import { useSpotData } from "../../context/SpotDataContext";
import { formatDistance } from "../../utils/view";
import { useSettings } from "../../context/SettingsContext";

export const SummaryPodsContainerView = () => {
    const { furthestSpot } = useSpotData();
    const { settings } = useSettings();

    let distance;
    if (!furthestSpot) {
        distance = "-";
    } else {
        const { d, unit } = formatDistance(furthestSpot, settings.unitType);
        distance = `${d} ${unit}`;
    }

    return (
        <div id="summaryPods">
            <SimpleGrid cols={{ base: 2, sm: 4 }}>
                <SummaryPodView label="Furthest" value={distance} />
                <SummaryPodView label="Label" value="Value" />
                <SummaryPodView label="Label" value="Value" />
                <SummaryPodView label="Label" value="Value" />
            </SimpleGrid>
        </div>
    );
};
