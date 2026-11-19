import { SelectedSpotDetail } from "./detail/SelectedSpotDetail";
import { SpotTable } from "./table/SpotTable";

import classes from "../DashboardScreen.module.css";

export const SpotsContainer = ({ spots }) => {
    return (
        <div className={classes.spotsContainer}>
            <SelectedSpotDetail />
            <SpotTable spots={spots} />
        </div>
    );
};
