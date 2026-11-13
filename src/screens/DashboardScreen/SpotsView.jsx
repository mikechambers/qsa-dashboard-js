import { useState } from "react";
import { SpotDetail } from "./SpotDetail";
import { SpotTable } from "./SpotTable";

export const SpotsView = ({ spots, selectedSpot, onSpotHighlight }) => {
    return (
        <div className="spotsView">
            <SpotDetail spot={selectedSpot} />
            <div className="spotsViewTable">
                <SpotTable spots={spots} onSpotHighlight={onSpotHighlight}/>
            </div>
        </div>
    );
};
