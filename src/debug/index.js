import Spot from "@/models/Spot";
import Location from "@/models/Location";
import { MIN_SNR } from "@/consts/config";

export const DEBUG = import.meta.env.VITE_DEBUG === "true";
// Mock spots for the dashboard.
//
// Keep your existing imports for Spot and Location at the top of this file.
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

const SENDER_LOCATION = { latitude: 37.58, longitude: -122.37, grid: "CM87TN" };
const SENDER_DXCC = { countryCode: "US", ituZone: 5, cqZone: 7 };

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

    return raw.map(
        (r, i) =>
            new Spot({
                sequence: i + 1,
                transmissionDate: new Date(NOW - Math.round(r.ago) * SECOND),
                mode: r.mode,
                band: r.rx.band,
                frequency: r.frequency,
                senderCall: "N0CALL",
                receiverCall: r.rx.call,
                distance: r.rx.km,
                snr: r.snr,
                senderDXCC: SENDER_DXCC,
                receiverDXCC: {
                    countryCode: r.rx.cc,
                    ituZone: r.rx.itu,
                    cqZone: r.rx.cq,
                },
                senderLocation: new Location(SENDER_LOCATION),
                receiverLocation: new Location({
                    latitude: r.rx.lat,
                    longitude: r.rx.lon,
                    grid: r.rx.grid,
                }),
            }),
    );
};

const OLDER = buildOlder();

// ---- your spots (dates and sequence numbers now relative) -------------------

const HAND_SPOTS = [
    new Spot({
        sequence: OLDER.length + 1,
        transmissionDate: at("2026-11-12T18:42:15Z"),
        mode: "FT8",
        band: "23CM",
        frequency: 1296065000,
        senderCall: "N0CALL",
        receiverCall: "VE7DLX",
        distance: 1310,
        snr: 8,
        senderDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        receiverDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        senderLocation: new Location({
            latitude: 37.58,
            longitude: -122.37,
            grid: "CM87TN",
        }),
        receiverLocation: new Location({
            latitude: 49.28,
            longitude: -123.12,
            grid: "CN89KG",
        }),
    }),
    new Spot({
        sequence: OLDER.length + 2,
        transmissionDate: at("2026-11-12T18:42:30Z"),
        mode: "FT8",
        band: "20M",
        frequency: 14076810,
        senderCall: "N0CALL",
        receiverCall: "W7GJ",
        distance: 1130,
        snr: -3,
        senderDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        receiverDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        senderLocation: new Location({
            latitude: 37.58,
            longitude: -122.37,
            grid: "CM87TN",
        }),
        receiverLocation: new Location({
            latitude: 47.61,
            longitude: -122.33,
            grid: "CN87UO",
        }),
    }),
    new Spot({
        sequence: OLDER.length + 3,
        transmissionDate: at("2026-11-12T18:42:45Z"),
        mode: "FT8",
        band: "20M",
        frequency: 14074960,
        senderCall: "N0CALL",
        receiverCall: "KH6BZF",
        distance: 3900,
        snr: 0,
        senderDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        receiverDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        senderLocation: new Location({
            latitude: 37.58,
            longitude: -122.37,
            grid: "CM87TN",
        }),
        receiverLocation: new Location({
            latitude: 21.31,
            longitude: -157.86,
            grid: "BL11BH",
        }),
    }),
    new Spot({
        sequence: OLDER.length + 4,
        transmissionDate: at("2026-11-12T18:43:00Z"),
        mode: "FT8",
        band: "20M",
        frequency: 14077350,
        senderCall: "N0CALL",
        receiverCall: "W5QY",
        distance: 2400,
        snr: -15,
        senderDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        receiverDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        senderLocation: new Location({
            latitude: 37.58,
            longitude: -122.37,
            grid: "CM87TN",
        }),
        receiverLocation: new Location({
            latitude: 32.78,
            longitude: -96.8,
            grid: "EM12OS",
        }),
    }),
    new Spot({
        sequence: OLDER.length + 5,
        transmissionDate: at("2026-11-12T18:43:07Z"),
        mode: "FT4",
        band: "15M",
        frequency: 21141800,
        senderCall: "N0CALL",
        receiverCall: "VK3DEF",
        distance: 12700,
        snr: -5,
        senderDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        receiverDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        senderLocation: new Location({
            latitude: 37.58,
            longitude: -122.37,
            grid: "CM87TN",
        }),
        receiverLocation: new Location({
            latitude: -37.81,
            longitude: 144.96,
            grid: "QF22LE",
        }),
    }),
    new Spot({
        sequence: OLDER.length + 6,
        transmissionDate: at("2026-11-12T18:43:15Z"),
        mode: "FT8",
        band: "20M",
        frequency: 14075870,
        senderCall: "N0CALL",
        receiverCall: "N1ABC",
        distance: 4300,
        snr: -19,
        senderDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        receiverDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        senderLocation: new Location({
            latitude: 37.58,
            longitude: -122.37,
            grid: "CM87TN",
        }),
        receiverLocation: new Location({
            latitude: 42.36,
            longitude: -71.06,
            grid: "FN42LI",
        }),
    }),
    new Spot({
        sequence: OLDER.length + 7,
        transmissionDate: at("2026-11-12T18:43:30Z"),
        mode: "FT8",
        band: "17M",
        frequency: 18101640,
        senderCall: "N0CALL",
        receiverCall: "JH1GEN",
        distance: 8300,
        snr: -21,
        senderDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        receiverDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        senderLocation: new Location({
            latitude: 37.58,
            longitude: -122.37,
            grid: "CM87TN",
        }),
        receiverLocation: new Location({
            latitude: 35.68,
            longitude: 139.69,
            grid: "PM95UQ",
        }),
    }),
    new Spot({
        sequence: OLDER.length + 8,
        transmissionDate: at("2026-11-12T18:43:45Z"),
        mode: "FT8",
        band: "15M",
        frequency: 21076100,
        senderCall: "N0CALL",
        receiverCall: "ZL2BCD",
        distance: 10500,
        snr: -16,
        senderDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        receiverDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        senderLocation: new Location({
            latitude: 37.58,
            longitude: -122.37,
            grid: "CM87TN",
        }),
        receiverLocation: new Location({
            latitude: -36.85,
            longitude: 174.76,
            grid: "RF73JD",
        }),
    }),
    new Spot({
        sequence: OLDER.length + 9,
        transmissionDate: at("2026-11-12T18:44:00Z"),
        mode: "FT8",
        band: "20M",
        frequency: 14075500,
        senderCall: "N0CALL",
        receiverCall: "DL1ABC",
        distance: 9120,
        snr: -22,
        senderDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        receiverDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        senderLocation: new Location({
            latitude: 37.58,
            longitude: -122.37,
            grid: "CM87TN",
        }),
        receiverLocation: new Location({
            latitude: 50.11,
            longitude: 8.68,
            grid: "JO40IC",
        }),
    }),
    new Spot({
        sequence: OLDER.length + 10,
        transmissionDate: at("2026-11-12T18:44:15Z"),
        mode: "FT8",
        band: "10M",
        frequency: 28076240,
        senderCall: "N0CALL",
        receiverCall: "XE2YY",
        distance: 2500,
        snr: -9,
        senderDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        receiverDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        senderLocation: new Location({
            latitude: 37.58,
            longitude: -122.37,
            grid: "CM87TN",
        }),
        receiverLocation: new Location({
            latitude: 25.69,
            longitude: -100.32,
            grid: "DL95UQ",
        }),
    }),
    new Spot({
        sequence: OLDER.length + 11,
        transmissionDate: at("2026-11-12T18:44:22Z"),
        mode: "FT4",
        band: "17M",
        frequency: 18105200,
        senderCall: "N0CALL",
        receiverCall: "PY2ABC",
        distance: 10500,
        snr: -14,
        senderDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        receiverDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        senderLocation: new Location({
            latitude: 37.58,
            longitude: -122.37,
            grid: "CM87TN",
        }),
        receiverLocation: new Location({
            latitude: -23.55,
            longitude: -46.63,
            grid: "GG66QK",
        }),
    }),
    new Spot({
        sequence: OLDER.length + 12,
        transmissionDate: at("2026-11-12T18:44:30Z"),
        mode: "FT8",
        band: "20M",
        frequency: 14078200,
        senderCall: "N0CALL",
        receiverCall: "G4ABC",
        distance: 8600,
        snr: -23,
        senderDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        receiverDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        senderLocation: new Location({
            latitude: 37.58,
            longitude: -122.37,
            grid: "CM87TN",
        }),
        receiverLocation: new Location({
            latitude: 51.51,
            longitude: -0.13,
            grid: "IO91WM",
        }),
    }),
    new Spot({
        sequence: OLDER.length + 13,
        transmissionDate: at("2026-11-12T18:44:45Z"),
        mode: "FT8",
        band: "20M",
        frequency: 14074680,
        senderCall: "N0CALL",
        receiverCall: "KL7ABC",
        distance: 3200,
        snr: -6,
        senderDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        receiverDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        senderLocation: new Location({
            latitude: 37.58,
            longitude: -122.37,
            grid: "CM87TN",
        }),
        receiverLocation: new Location({
            latitude: 61.22,
            longitude: -149.9,
            grid: "BP51BF",
        }),
    }),
    new Spot({
        sequence: OLDER.length + 14,
        transmissionDate: at("2026-11-12T18:45:00Z"),
        mode: "FT8",
        band: "20M",
        frequency: 14076020,
        senderCall: "N0CALL",
        receiverCall: "AC0DEN",
        distance: 1550,
        snr: 2,
        senderDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        receiverDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        senderLocation: new Location({
            latitude: 37.58,
            longitude: -122.37,
            grid: "CM87TN",
        }),
        receiverLocation: new Location({
            latitude: 39.74,
            longitude: -104.99,
            grid: "DM79MR",
        }),
    }),
    new Spot({
        sequence: OLDER.length + 15,
        transmissionDate: at("2026-11-12T18:45:07Z"),
        mode: "FT4",
        band: "20M",
        frequency: 14080900,
        senderCall: "N0CALL",
        receiverCall: "W6DEF",
        distance: 140,
        snr: 8,
        senderDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        receiverDXCC: { countryCode: "US", ituZone: 5, cqZone: 7 },
        senderLocation: new Location({
            latitude: 37.58,
            longitude: -122.37,
            grid: "CM87TN",
        }),
        receiverLocation: new Location({
            latitude: 38.58,
            longitude: -121.49,
            grid: "CM98GN",
        }),
    }),
];

export const MOCK_SPOTS = [...OLDER, ...HAND_SPOTS];
