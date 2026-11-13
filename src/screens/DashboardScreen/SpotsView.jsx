import { useState } from "react";
import { SpotDetail } from "./SpotDetail";
import { SpotTable } from "./SpotTable";

export const SpotsView = ({ spots, selectedSpot, onSpotHighlight }) => {
    return (
        <div>
            <SpotDetail spot={selectedSpot} />
            <SpotTable spots={spots} onSpotHighlight={onSpotHighlight}/>
        </div>
    );
};
