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

//Builds all of the app icons from design/icon.svg. Run with: npm run icons

import { execFileSync } from "node:child_process";
import {
    copyFileSync,
    mkdtempSync,
    readdirSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SOURCE = "design/icon.svg";
const OUTPUT = "src-tauri/icons";

//macOS icons have a transparent margin around them: the artwork is 824px of
//1024. Without it the icon looks bigger than the others in the Dock. icon.png
//is the Dock icon while running tauri dev
const MAC_FILES = ["icon.icns", "icon.png"];
const MAC_SIZE = 824;
const MAC_MARGIN = (1024 - MAC_SIZE) / 2;

const work = mkdtempSync(join(tmpdir(), "icons-"));

const generate = (input, folder) => {
    execFileSync("npx", ["tauri", "icon", input, "-o", folder], {
        stdio: "inherit",
        shell: process.platform === "win32",
    });
};

//nest the artwork inside a bigger, empty svg. It needs a viewBox to scale
const makeMacSvg = (svg) => {
    const root = svg.match(/<svg\b[^>]*>/)?.[0];
    if (!root?.includes("viewBox")) {
        throw new Error(`${SOURCE} needs a viewBox on its <svg> tag`);
    }

    const inner = root
        .replace(/\s(x|y|width|height)="[^"]*"/g, "")
        .replace(
            "<svg",
            `<svg x="${MAC_MARGIN}" y="${MAC_MARGIN}" width="${MAC_SIZE}" height="${MAC_SIZE}"`,
        );
    const artwork = svg.slice(svg.indexOf(root)).replace(root, inner);

    return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${artwork}</svg>`;
};

try {
    const macSvg = join(work, "icon-macos.svg");
    writeFileSync(macSvg, makeMacSvg(readFileSync(SOURCE, "utf8")));

    generate(SOURCE, join(work, "all"));
    generate(macSvg, join(work, "mac"));

    //only the desktop files: tauri also makes android and ios folders
    for (const entry of readdirSync(join(work, "all"), {
        withFileTypes: true,
    })) {
        if (!entry.isFile()) continue;

        const from = MAC_FILES.includes(entry.name) ? "mac" : "all";
        copyFileSync(join(work, from, entry.name), join(OUTPUT, entry.name));
    }

    //the website's icon
    copyFileSync(SOURCE, "public/favicon.svg");
} finally {
    rmSync(work, { recursive: true, force: true });
}
