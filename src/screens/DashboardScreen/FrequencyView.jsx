export const FrequencyView = ({ frequency }) => {
    let f = "";
    if (frequency) {
        f = new Intl.NumberFormat("de-DE",{
  maximumFractionDigits: 0
}).format(frequency / 1000);
    }

    return <div>{f}</div>;
};
