import classes from "./DashboardScreen.module.css";
import { SpotTable } from "./SpotTable";

export const SpotTableContainer = ({ spots, onSpotHighlight }) => {
    //todo: do we need these two divs?
    return (
        <div className={classes.spotsView}>
            <div className={classes.spotsViewTable}>
                <SpotTable spots={spots} onSpotHighlight={onSpotHighlight} />
            </div>
        </div>
    );
};
