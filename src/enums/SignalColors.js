const SignalColors = {
    VERY_WEAK: "VERY_WEAK",
    WEAK: "WEAK",
    FAIR: "FAIR",
    GOOD: "GOOD",
    STRONG: "STRONG",
};

const VALUES = {
    VERY_WEAK: { hex: "#ED5C48", label: "Very Weak" },
    WEAK: { hex: "#FD843E", label: "Weak" },
    FAIR: { hex: "#F5C842", label: "Fair" },
    GOOD: { hex: "#A3D94F", label: "Good" },
    STRONG: { hex: "#4CC764", label: "Strong" },
};

export const SignalColor = Object.freeze({
    ...SignalColors,

    cases: Object.values(SignalColors),

    getColor: (name) => VALUES[name].hex,
    getLabel: (name) => VALUES[name].label,

    getNameForSNR: (snr) => {
        if (snr >= 3) return SignalColor.STRONG;
        if (snr >= -4) return SignalColor.GOOD;
        if (snr >= -10) return SignalColor.FAIR;
        if (snr >= -17) return SignalColor.WEAK;
        return SignalColor.VERY_WEAK;
    },

    getColorForSNR: (snr) =>
        SignalColor.getColor(SignalColor.getNameForSNR(snr)),
});
