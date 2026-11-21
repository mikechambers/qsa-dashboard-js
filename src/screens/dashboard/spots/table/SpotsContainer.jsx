import classes from "./DashboardScreen.module.css";
import { SpotTable } from "./SpotTable";

export const SpotTableContainer = ({ onSpotHighlight }) => {
    //todo: do we need these two divs?
    return (
        <div className={classes.spotsView}>
            <div className={classes.spotsViewTable}>
                <SpotTable onSpotHighlight={onSpotHighlight} />
            </div>
        </div>
    );
};
