export const epochToDate = (epoch) => {
    if(epoch === null || epoch === undefined) {
        return null;
    }

    return new Date(epoch * 1000);
}