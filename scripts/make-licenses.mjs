/* MIT License
 *
 * Copyright (c) 2026 Mike Chambers
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

//writes public/third-party-licenses.txt, the license notices shown from the
//About screen. Runs before dev and build, so it follows the installed packages
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public/third-party-licenses.txt");
const LICENSE_FILE = /^(licen[sc]e|copying|copyright|notice|unlicense|ofl)/i;

//set by Tauri when it runs dev or build. The web version has no Rust or
//offline map, and building it must not need cargo
const DESKTOP = Boolean(process.env.TAURI_ENV_PLATFORM);

const read = (path) => readFileSync(path, "utf8").replace(/\r\n/g, "\n").trim();

const licenseTexts = (dir) =>
    readdirSync(dir, { withFileTypes: true })
        .filter((f) => f.isFile() && LICENSE_FILE.test(f.name))
        .map((f) => read(join(dir, f.name)))
        .sort();

//every installed package that isn't only for development
const npmPackages = () => {
    const lock = JSON.parse(read(join(ROOT, "package-lock.json")));

    return Object.entries(lock.packages)
        .filter(([path, p]) => path && !p.dev && existsSync(join(ROOT, path)))
        .map(([path]) => {
            const dir = join(ROOT, path);
            const p = JSON.parse(read(join(dir, "package.json")));

            return {
                name: p.name,
                version: p.version,
                license: p.license,
                url: p.homepage ?? p.repository?.url ?? p.repository,
                texts: licenseTexts(dir),
            };
        });
};

//the crates that end up in the app: normal dependencies for the target, not
//build or test ones
const rustCrates = () => {
    const args = ["metadata", "--format-version", "1"];
    args.push("--manifest-path", join(ROOT, "src-tauri/Cargo.toml"));

    const target = process.env.TAURI_ENV_TARGET_TRIPLE;
    if (target) args.push("--filter-platform", target);

    const { packages, resolve } = JSON.parse(
        execFileSync("cargo", args, { maxBuffer: 256 * 1024 * 1024 }),
    );

    const nodes = new Map(resolve.nodes.map((n) => [n.id, n]));
    const used = new Set();
    const queue = [resolve.root];

    while (queue.length) {
        for (const dep of nodes.get(queue.pop()).deps) {
            const normal = dep.dep_kinds.some((k) => k.kind === null);

            if (normal && !used.has(dep.pkg)) {
                used.add(dep.pkg);
                queue.push(dep.pkg);
            }
        }
    }

    return packages
        .filter((p) => used.has(p.id))
        .map((p) => ({
            name: p.name,
            version: p.version,
            license: p.license,
            url: p.repository ?? p.homepage,
            authors: p.authors,
            texts: licenseTexts(dirname(p.manifest_path)),
        }));
};

//for packages published without their license file. Each text was copied from
//the project's repository
const FALLBACKS = [
    [/^@protomaps\/basemaps$/, "protomaps-basemaps"],
    [/^embla-carousel/, "embla-carousel"],
    [/^murmurhash-js$/, "murmurhash-js"],
    [/^(objc2|block2|dispatch2)/, "objc2"],
    [/^alloc-stdlib$/, "alloc-stdlib"],
    [/^pmtiles$/, "pmtiles"],
    [/^react-remove-scroll-bar$/, "react-remove-scroll-bar"],
    [/^webview2-com/, "webview2-com"],
    [/^dlopen2/, "dlopen2"],
    [/^libappindicator-sys$/, "libappindicator"],
    [/^selectors$/, "mpl-2.0"],
];

const savedText = (name) => read(join(ROOT, "scripts/licenses", `${name}.txt`));

const withFallback = (p) => {
    if (p.texts.length) return p;

    const match = FALLBACKS.find(([pattern]) => pattern.test(p.name));
    return match ? { ...p, texts: [savedText(match[1])] } : p;
};

//things that aren't packages, so have to be listed by hand
const offlineMapAssets = () => {
    const fontLicense = join(ROOT, "src-tauri/resources/map/fonts/OFL.txt");

    if (!existsSync(fontLicense)) {
        throw new Error("Offline map fonts not found. Run npm run fetch-map");
    }

    return [
        {
            name: "Noto Sans (offline map labels)",
            license: "OFL-1.1",
            url: "https://github.com/notofonts",
            texts: [read(fontLicense)],
        },
        {
            name: "Tangram Icons (offline map icons)",
            license: "MIT",
            url: "https://github.com/tangrams/icons",
            texts: [savedText("tangram-icons")],
        },
        {
            name: "Offline map data",
            license: "ODbL-1.0",
            url: "https://www.openstreetmap.org/copyright",
            texts: [
                "Map data © OpenStreetMap contributors, available under the Open Database License (https://opendatacommons.org/licenses/odbl/). Tiles by Protomaps (https://protomaps.com). Also includes data from Natural Earth (https://www.naturalearthdata.com).",
            ],
        },
    ];
};

const heading = (p) =>
    [
        [p.name, p.version].filter(Boolean).join(" "),
        p.license && `(${p.license})`,
        p.url,
        !p.texts.length && p.authors?.length && `by ${p.authors.join(", ")}`,
    ]
        .filter(Boolean)
        .join(" ");

const packages = [
    ...npmPackages(),
    ...(DESKTOP ? [...rustCrates(), ...offlineMapAssets()] : []),
]
    .map(withFallback)
    .sort((a, b) => a.name.localeCompare(b.name));

//many packages share a license word for word, so each text is written once,
//under all the packages it covers
const byText = new Map();

for (const p of packages) {
    const text = p.texts.join("\n\n") || "No license file is included.";

    if (!byText.has(text)) byText.set(text, []);
    byText.get(text).push(heading(p));
}

const divider = `\n\n${"-".repeat(72)}\n\n`;
const intro =
    "QSA Dashboard uses the following third-party software, fonts and data.";
const sections = [...byText].map(
    ([text, names]) => `${names.join("\n")}\n\n${text}`,
);

writeFileSync(OUT, [intro, ...sections].join(divider) + "\n");

const missing = packages.filter((p) => !p.texts.length);
console.log(`${packages.length} third-party licenses written`);

if (missing.length) {
    console.warn(
        `No license text for: ${missing.map((p) => p.name).join(", ")}`,
    );
}
