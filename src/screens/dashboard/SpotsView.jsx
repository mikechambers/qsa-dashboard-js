import classes from "./DashboardScreen.module.css";
import { SpotTable } from "./SpotTable";

export const SpotsView = ({ spots, onSpotHighlight }) => {
    return (
        <div className={classes.spotsView}>
            <div className={classes.spotsViewTable}>
                <SpotTable spots={spots} onSpotHighlight={onSpotHighlight} />
            </div>
        </div>
    );
};
