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

//offline map style for the desktop app. Only load this through mapStyle.js,
//which imports it on demand so it stays out of the main web bundle.

import { convertFileSrc } from "@tauri-apps/api/core";
import { resolveResource } from "@tauri-apps/api/path";
import { layers, namedFlavor } from "@protomaps/basemaps";
import { addProtocol } from "maplibre-gl";
import { Protocol } from "pmtiles";

//Protomaps data visualization styles for our light and dark themes. The name
//picks both the colors and the sprites (which fetch-map.sh has to download)
const FLAVORS = { light: "white", dark: "black" };

//lets maplibre read pmtiles:// URLs. Runs once, when this file is first loaded
addProtocol("pmtiles", new Protocol().tile);

export async function getDesktopMapStyle(theme) {
    //"map" is where tauri.conf.json puts the bundled map files
    const mapDir = await resolveResource("map");

    //convertFileSrc escapes the whole path, so anything maplibre needs to fill
    //in ({fontstack}, sprite file extensions) is added after the conversion
    const baseUrl = convertFileSrc(mapDir);
    const tilesUrl = convertFileSrc(`${mapDir}/world.pmtiles`);

    const flavor = FLAVORS[theme];

    return {
        version: 8,
        glyphs: `${baseUrl}/fonts/{fontstack}/{range}.pbf`,
        sprite: `${baseUrl}/sprites/${flavor}`,
        sources: {
            protomaps: {
                type: "vector",
                url: `pmtiles://${tilesUrl}`,
                //target="_blank" so they open in the system browser, rather than
                //replacing the app
                attribution:
                    '<a href="https://protomaps.com" target="_blank">Protomaps</a> © <a href="https://openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
            },
        },
        layers: layers("protomaps", namedFlavor(flavor), { lang: "en" }),
    };
}
