import { SimpleGrid } from "@mantine/core";
import { SummaryPodView } from "./SummaryPodView";
import { useSpotData } from "../../context/SpotDataContext";
import { convertAndFormatDistance } from "../../utils/view";
import { useSettings } from "../../context/SettingsContext";
import { ElapsedTimePod } from "./ElapsedTimePod";
import { RecentContactPod } from "./RecentContactPod";

export const SummaryPodsContainerView = () => {
    const { furthestSpot, uniqueStations, mostRecentContact } = useSpotData();
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
                <ElapsedTimePod />
                <RecentContactPod mostRecentContact={mostRecentContact} />
            </SimpleGrid>
        </div>
    );
};
