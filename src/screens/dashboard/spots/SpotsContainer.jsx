import { SelectedSpotDetail } from "./detail/SelectedSpotDetail";
import { SpotTable } from "./table/SpotTable";

import classes from "../DashboardScreen.module.css";

export const SpotsContainer = () => {
    return (
        <div className={classes.spotsContainer}>
            <SelectedSpotDetail />
            <SpotTable />
        </div>
    );
};
