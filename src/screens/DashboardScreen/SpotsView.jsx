import { useState } from "react";
import { SpotTable } from "./SpotTable";

export const SpotsView = ({ spots, selectedSpot, onSpotHighlight }) => {
    return (
        <div className="spotsView">
            <div className="spotsViewTable">
                <SpotTable spots={spots} onSpotHighlight={onSpotHighlight}/>
            </div>
        </div>
    );
};
