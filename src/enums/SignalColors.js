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
    FAIR: { hex: "#FFAF3E", label: "Fair" },
    GOOD: { hex: "#E8D347", label: "Good" },
    STRONG: { hex: "#76D970", label: "Strong" },
};

export const SignalColor = Object.freeze({
    ...SignalColors,

    cases: Object.values(SignalColors),

    getColor: (name) => VALUES[name].hex,
    getLabel: (name) => VALUES[name].label,

    getColorForSNR: (snr) => {
        if (snr >= 3) {
            return SignalColor.getColor(SignalColor.STRONG);
        } else if (snr >= -4) {
            return SignalColor.getColor(SignalColor.GOOD);
        } else if (snr >= -10) {
            return SignalColor.getColor(SignalColor.FAIR);
        } else if (snr >= -17) {
            return SignalColor.getColor(SignalColor.WEAK);
        } else {
            return SignalColor.getColor(SignalColor.VERY_WEAK);
        }
    },
});
