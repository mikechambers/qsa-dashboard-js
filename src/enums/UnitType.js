const UnitTypes = {
    IMPERIAL: "IMPERIAL",
    METRIC: "METRIC",
};

export const UnitType = Object.freeze({
    ...UnitTypes,

    getDistanceUnit: (unitType, short = true) => {
        switch (unitType) {
            case UnitTypes.IMPERIAL:
                return short ? "mi" : "miles";
            case UnitTypes.METRIC:
                return short ? "km" : "kilometers";
            default:
                return undefined;
        }
    },
});
