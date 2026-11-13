const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export const getColorForSnr = (snr) => {
    const s = clamp(snr, -24, 10);

    const hue = s < 0 ? ((s + 24) / 24) * 60 : 60 + (s / 10) * 60;

    return `hsl(${hue}, 100%, 50%)`;
};

export const SNRView = ({ snr }) => {
    return (
        <div className="spotTableCell">
            <div style={{ display: "inline-block" }}>
                <div>{snr} dB</div>
                <div
                    style={{
                        height: "4px",
                        marginTop: "2px",
                        borderRadius: "6px",
                        background: getColorForSnr(snr),
                    }}
                />
            </div>
        </div>
    );
};
