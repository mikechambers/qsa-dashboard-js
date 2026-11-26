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

import { useEffect, useState } from "react";
import { Map } from "maplibre-gl";

//initialize map instance, and set ready property once it has loaded.
//getStyle can be async, as the desktop style has to look up local file paths.
export function useMapInstance(containerRef, { getStyle, center, zoom }) {
    const [map, setMap] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let m;
        let cancelled = false;

        getStyle()
            .then((style) => {
                //unmounted while we were waiting
                if (cancelled) return;

                m = new Map({
                    container: containerRef.current,
                    style,
                    center,
                    zoom,
                });
                m.on("load", () => setReady(true));
                setMap(m);
            })
            .catch((e) => console.error("Error creating map", e));

        return () => {
            cancelled = true;
            m?.remove();
            setMap(null);
            setReady(false);
        };
    }, []);

    return { map, ready };
}
