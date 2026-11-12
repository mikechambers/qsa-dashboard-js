

const Modes = {
    M2200M : "2200m",
    M630M : "630m",
    M160M : "160m",
    M80M : "80m",
    M60M : "60m",
    M40M : "40m",
    M30M : "30m",
    M20M : "20m",
    M17M : "17m",
    M15M : "15m",
    M12M : "12m",
    M10M : "10m",
    M6M : "6m",
    M4M : "4m",
    M2M : "2m",
    M1_25M : "1.25cm",
    M70CM : "70cm",
    M33CM : "33cm",
    M23CM : "23cm"
}

export const Mode = Object.freeze({
    ...Modes,

    fromData : (v) => {
        if(!v) {
            return undefined
        }

        const upper = v.toUpperCase();
		return Object.values(Bands).find((v) => v === upper)
    }
});