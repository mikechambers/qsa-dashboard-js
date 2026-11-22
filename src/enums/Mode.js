const Modes = {
    FT8: "FT8",
    FT4: "FT4",
    JS8: "JS8",
    CW: "CW",
    MFSK: "MFSK",
    JT9: "JT9",
    JT65: "JT65",
    PSK31: "PSK31",
    PSK63: "PSK63",
    RTTY: "RTTY",
    SSB: "SSB",
    OLIVIA: "OLIVIA",
    UNKNOWN: "UNKNOWN",
};

export const Mode = Object.freeze({
    ...Modes,

    get cases() {
        return Object.values(Modes);
    },

    fromData: (v) => {
        if (!v) {
            return Modes.UNKNOWN;
        }

        const upper = v.toUpperCase();
        return Object.values(Modes).find((m) => m === upper) ?? Modes.UNKNOWN;
    },
});
