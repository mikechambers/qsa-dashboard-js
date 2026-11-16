const Bands = {
    B2200M: "2200M",
    B630M: "630M",
    B160M: "160M",
    B80M: "80M",
    B60M: "60M",
    B40M: "40M",
    B30M: "30M",
    B20M: "20M",
    B17M: "17M",
    B15M: "15M",
    B12M: "12M",
    B10M: "10M",
    B6M: "6M",
    B4M: "4M",
    B2M: "2M",
    B125M: "125M",
    B70CM: "70CM",
    B33CM: "33CM",
    B23CM: "23CM",
};

export const Band = Object.freeze({
    ...Bands,

    get cases() {
        return Object.values(Bands);
    },

    fromData: (v) => {
        if (!v) {
            return undefined;
        }

        const upper = v.toUpperCase();
        return Object.values(Bands).find((v) => v === upper);
    },
});
