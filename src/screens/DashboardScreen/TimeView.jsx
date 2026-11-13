export const TimeView = ({ date }) => {
    let utcTime = "";

    if (date) {
        utcTime = new Intl.DateTimeFormat("en-GB", {
            timeZone: "UTC",
            hour: "2-digit",
            minute: "2-digit",
        
            hourCycle: "h23",
        }).format(date);
    }

    return <div>{utcTime ?? ""}</div>;
};
