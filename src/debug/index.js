import Spot from "@/models/Spot";
import { MIN_SNR } from "@/consts/config";

export const DEBUG = import.meta.env.VITE_DEBUG === "true";

// Mock spots for the dashboard.
//
// Every spot is first written as a raw message in the same shape PSK Reporter
// sends (sq, t, f, rp, sc, rc, sl, rl, sa, ra, b, md), then run through
// Spot.fromData, so mock spots take the same path as live ones (grids turn
// into locations, DXCC lookups, distance).
//
// All dates are relative to when this module loads, so the data always looks
// "live": your 15 hand-written spots are the newest ones (the last is 20 s old),
// and OLDER fills the rest of the last 30 minutes with a band that is opening up
// (more spots, and further away, as time gets closer to now).
//
// The random numbers are seeded, so the shape of the data is the same on every
// reload. Only the clock changes.

const SECOND = 1000;
const NOW = Date.now();

// ---- your hand-written spots: same spacing, anchored to now -----------------

const REF_LAST = Date.parse("2026-11-12T18:45:07Z"); // newest original timestamp
const at = (iso) => new Date(NOW - 20 * SECOND - (REF_LAST - Date.parse(iso)));

// ---- generated older spots --------------------------------------------------

const SENDER_CALL = "N0CALL";
const SENDER_GRID = "CM87TN";

// DXCC entity numbers, which is what PSK Reporter sends for sa / ra
const DXCC = {
    US: 291,
    CA: 1,
    MX: 50,
    JP: 339,
    KR: 137,
    AU: 150,
    NZ: 170,
    BR: 108,
    DE: 230,
    GB: 223,
    IT: 248,
};
const SENDER_DXCC = DXCC.US;

// a raw PSK Reporter style message, ready for Spot.fromData
const toData = ({ sequence, date, mode, band, frequency, snr, call, grid, dxcc }) => {
    const epoch = Math.floor(date.getTime() / 1000);
    return {
        sq: sequence,
        t: epoch,
        t_tx: epoch,
        f: frequency,
        rp: snr,
        md: mode,
        b: band,
        sc: SENDER_CALL,
        rc: call,
        sl: SENDER_GRID,
        rl: grid,
        sa: SENDER_DXCC,
        ra: dxcc,
    };
};

// Receivers. km is the distance from the sender, band is where they usually hear you.
const RECEIVERS = [
    {
        call: "W6DEF",
        km: 140,
        band: "20M",
        lat: 38.58,
        lon: -121.49,
        grid: "CM98GN",
        cc: "US",
        itu: 6,
        cq: 3,
    },
    {
        call: "K7PDX",
        km: 850,
        band: "20M",
        lat: 45.52,
        lon: -122.68,
        grid: "CN85PM",
        cc: "US",
        itu: 6,
        cq: 3,
    },
    {
        call: "W7SLC",
        km: 960,
        band: "20M",
        lat: 40.76,
        lon: -111.89,
        grid: "DN40BS",
        cc: "US",
        itu: 6,
        cq: 4,
    },
    {
        call: "K7PHX",
        km: 1050,
        band: "20M",
        lat: 33.45,
        lon: -112.07,
        grid: "DM33WK",
        cc: "US",
        itu: 6,
        cq: 3,
    },
    {
        call: "W7GJ",
        km: 1130,
        band: "20M",
        lat: 47.61,
        lon: -122.33,
        grid: "CN87UO",
        cc: "US",
        itu: 6,
        cq: 3,
    },
    {
        call: "VE7DLX",
        km: 1310,
        band: "20M",
        lat: 49.28,
        lon: -123.12,
        grid: "CN89KG",
        cc: "CA",
        itu: 2,
        cq: 3,
    },
    {
        call: "AC0DEN",
        km: 1550,
        band: "20M",
        lat: 39.74,
        lon: -104.99,
        grid: "DM79MR",
        cc: "US",
        itu: 7,
        cq: 4,
    },
    {
        call: "W5QY",
        km: 2400,
        band: "20M",
        lat: 32.78,
        lon: -96.8,
        grid: "EM12OS",
        cc: "US",
        itu: 7,
        cq: 4,
    },
    {
        call: "XE2YY",
        km: 2500,
        band: "10M",
        lat: 25.69,
        lon: -100.32,
        grid: "DL95UQ",
        cc: "MX",
        itu: 10,
        cq: 6,
    },
    {
        call: "K9ABC",
        km: 2960,
        band: "20M",
        lat: 41.88,
        lon: -87.63,
        grid: "EN61FV",
        cc: "US",
        itu: 7,
        cq: 4,
    },
    {
        call: "KL7ABC",
        km: 3200,
        band: "20M",
        lat: 61.22,
        lon: -149.9,
        grid: "BP51BF",
        cc: "US",
        itu: 1,
        cq: 1,
    },
    {
        call: "KH6BZF",
        km: 3900,
        band: "20M",
        lat: 21.31,
        lon: -157.86,
        grid: "BL11BH",
        cc: "US",
        itu: 61,
        cq: 31,
    },
    {
        call: "W4MIA",
        km: 4150,
        band: "20M",
        lat: 25.76,
        lon: -80.19,
        grid: "EL95SS",
        cc: "US",
        itu: 8,
        cq: 5,
    },
    {
        call: "N1ABC",
        km: 4300,
        band: "20M",
        lat: 42.36,
        lon: -71.06,
        grid: "FN42LI",
        cc: "US",
        itu: 8,
        cq: 5,
    },
    {
        call: "JH1GEN",
        km: 8300,
        band: "17M",
        lat: 35.68,
        lon: 139.69,
        grid: "PM95UQ",
        cc: "JP",
        itu: 45,
        cq: 25,
    },
    {
        call: "G4ABC",
        km: 8600,
        band: "20M",
        lat: 51.51,
        lon: -0.13,
        grid: "IO91WM",
        cc: "GB",
        itu: 27,
        cq: 14,
    },
    {
        call: "HL1ABC",
        km: 9000,
        band: "17M",
        lat: 37.57,
        lon: 126.98,
        grid: "PM37NN",
        cc: "KR",
        itu: 44,
        cq: 25,
    },
    {
        call: "DL1ABC",
        km: 9120,
        band: "20M",
        lat: 50.11,
        lon: 8.68,
        grid: "JO40IC",
        cc: "DE",
        itu: 28,
        cq: 14,
    },
    {
        call: "I0ABC",
        km: 9950,
        band: "20M",
        lat: 41.9,
        lon: 12.5,
        grid: "JN61FV",
        cc: "IT",
        itu: 28,
        cq: 15,
    },
    {
        call: "ZL2BCD",
        km: 10500,
        band: "15M",
        lat: -36.85,
        lon: 174.76,
        grid: "RF73JD",
        cc: "NZ",
        itu: 60,
        cq: 32,
    },
    {
        call: "PY2ABC",
        km: 10500,
        band: "17M",
        lat: -23.55,
        lon: -46.63,
        grid: "GG66QK",
        cc: "BR",
        itu: 15,
        cq: 11,
    },
    {
        call: "VK2XYZ",
        km: 11940,
        band: "15M",
        lat: -33.87,
        lon: 151.21,
        grid: "QF56OD",
        cc: "AU",
        itu: 59,
        cq: 30,
    },
    {
        call: "VK3DEF",
        km: 12700,
        band: "15M",
        lat: -37.81,
        lon: 144.96,
        grid: "QF22LE",
        cc: "AU",
        itu: 59,
        cq: 30,
    },
]; // already sorted by distance

const FT8_BASE = {
    "20M": 14074000,
    "17M": 18100000,
    "15M": 21074000,
    "10M": 28074000,
};
const FT4_BASE = {
    "20M": 14080000,
    "17M": 18104000,
    "15M": 21140000,
    "10M": 28180000,
};

// small seeded random number generator (mulberry32)
const makeRng = (seed) => () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const buildOlder = () => {
    const rng = makeRng(7);
    const raw = [];

    // minutes 29 down to 4 ago (the hand-written spots cover the last ~3.5 min)
    for (let m = 29; m >= 4; m--) {
        const openness = (29 - m) / 29; // 0 = 30 min ago, 1 = now
        const count = 2 + Math.floor(openness * 5) + Math.floor(rng() * 3);
        const reach = Math.floor(RECEIVERS.length * (0.35 + 0.65 * openness));

        for (let j = 0; j < count; j++) {
            // mostly nearby stations, now and then a far one
            const far = rng() < 0.08;
            const idx = far
                ? Math.floor(reach * (0.7 + 0.3 * rng()))
                : Math.floor(Math.pow(rng(), 1.5) * (reach + 1));
            const rx = RECEIVERS[Math.min(idx, reach)];

            const snr = Math.max(
                MIN_SNR,
                Math.min(
                    12,
                    Math.round(
                        6 - rx.km / 700 + 3 * openness + (rng() * 12 - 6),
                    ),
                ),
            );
            const mode = rng() < 0.2 ? "FT4" : "FT8";
            const base = mode === "FT8" ? FT8_BASE[rx.band] : FT4_BASE[rx.band];

            raw.push({
                ago: m * 60 + rng() * 60, // seconds ago
                rx,
                snr,
                mode,
                frequency: base + Math.floor(rng() * 3000),
            });
        }
    }

    raw.sort((a, b) => b.ago - a.ago); // oldest first

    return raw.map((r, i) =>
        toData({
            sequence: i + 1,
            date: new Date(NOW - Math.round(r.ago) * SECOND),
            mode: r.mode,
            band: r.rx.band,
            frequency: r.frequency,
            snr: r.snr,
            call: r.rx.call,
            grid: r.rx.grid,
            dxcc: DXCC[r.rx.cc],
        }),
    );
};

const OLDER = buildOlder();

// ---- your spots (dates and sequence numbers now relative) -------------------
// [time, mode, band, frequency, receiver call, snr, receiver grid, receiver dxcc]

const HAND_SPOTS = [
    ["2026-11-12T18:42:15Z", "FT8", "23CM", 1296065000, "VE7DLX", 8, "CN89KG", DXCC.CA],
    ["2026-11-12T18:42:30Z", "FT8", "20M", 14076810, "W7GJ", -3, "CN87UO", DXCC.US],
    ["2026-11-12T18:42:45Z", "FT8", "20M", 14074960, "KH6BZF", 0, "BL11BH", 110],
    ["2026-11-12T18:43:00Z", "FT8", "20M", 14077350, "W5QY", -15, "EM12OS", DXCC.US],
    ["2026-11-12T18:43:07Z", "FT4", "15M", 21141800, "VK3DEF", -5, "QF22LE", DXCC.AU],
    ["2026-11-12T18:43:15Z", "FT8", "20M", 14075870, "N1ABC", -19, "FN42LI", DXCC.US],
    ["2026-11-12T18:43:30Z", "FT8", "17M", 18101640, "JH1GEN", -21, "PM95UQ", DXCC.JP],
    ["2026-11-12T18:43:45Z", "FT8", "15M", 21076100, "ZL2BCD", -16, "RF73JD", DXCC.NZ],
    ["2026-11-12T18:44:00Z", "FT8", "20M", 14075500, "DL1ABC", -22, "JO40IC", DXCC.DE],
    ["2026-11-12T18:44:15Z", "FT8", "10M", 28076240, "XE2YY", -9, "DL95UQ", DXCC.MX],
    ["2026-11-12T18:44:22Z", "FT4", "17M", 18105200, "PY2ABC", -14, "GG66QK", DXCC.BR],
    ["2026-11-12T18:44:30Z", "FT8", "20M", 14078200, "G4ABC", -23, "IO91WM", DXCC.GB],
    ["2026-11-12T18:44:45Z", "FT8", "20M", 14074680, "KL7ABC", -6, "BP51BF", 6],
    ["2026-11-12T18:45:00Z", "FT8", "20M", 14076020, "AC0DEN", 2, "DM79MR", DXCC.US],
    ["2026-11-12T18:45:07Z", "FT4", "20M", 14080900, "W6DEF", 8, "CM98GN", DXCC.US],
].map(([iso, mode, band, frequency, call, snr, grid, dxcc], i) =>
    toData({
        sequence: OLDER.length + i + 1,
        date: at(iso),
        mode,
        band,
        frequency,
        snr,
        call,
        grid,
        dxcc,
    }),
);

export const MOCK_SPOTS = [...OLDER, ...HAND_SPOTS].map((data) =>
    Spot.fromData(data),
);
