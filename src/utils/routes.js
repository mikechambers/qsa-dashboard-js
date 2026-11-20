import { DASHBOARD_PATH } from "@/consts/config";

//builds the url for a dashboard. The grid is optional, so it is left out
//(instead of leaving an empty segment like /dashboard/CALL//) when blank.
export const dashboardPath = (callsign, grid) => {
    const c = encodeURIComponent(callsign);
    const g = grid ? `${encodeURIComponent(grid)}/` : "";

    return `${DASHBOARD_PATH}/${c}/${g}`;
};
