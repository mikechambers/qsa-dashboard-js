export const epochToDate = (epoch) => {
    if (epoch == null) {
        return null;
    }

    return new Date(epoch * 1000);
};
