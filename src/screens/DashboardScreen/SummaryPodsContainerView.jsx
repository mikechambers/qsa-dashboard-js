import { SimpleGrid } from "@mantine/core";
import { SummaryPodView } from "./SummaryPodView";
import { useSpotData } from "../../context/SpotDataContext";
import { convertAndFormatDistance } from "../../utils/view";
import { useSettings } from "../../context/SettingsContext";

export const SummaryPodsContainerView = () => {
    const { furthestSpot, uniqueStations } = useSpotData();
    const { settings } = useSettings();

    const { d, unit } = furthestSpot
        ? convertAndFormatDistance(furthestSpot.distance, settings.unitType)
        : {};

    return (
        <div id="summaryPods">
            <SimpleGrid cols={{ base: 2, sm: 4 }}>
                <SummaryPodView label="Furthest" value={d} unit={unit} />
                <SummaryPodView
                    label="Unique Stations"
                    value={uniqueStations}
                />
                <SummaryPodView label="Label" value="Value" />
                <SummaryPodView label="Label" value="Value" />
            </SimpleGrid>
        </div>
    );
};
