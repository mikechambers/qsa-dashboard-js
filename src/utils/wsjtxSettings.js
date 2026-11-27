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

//checks and wording for the WSJT-X settings

//an IPv4 address, such as 127.0.0.1
export function isValidAddress(address) {
    const parts = address.trim().split(".");

    return (
        parts.length === 4 &&
        parts.every((p) => /^(0|[1-9]\d{0,2})$/.test(p) && Number(p) <= 255)
    );
}

export function isValidPort(port) {
    const text = String(port).trim();

    return /^\d+$/.test(text) && Number(text) >= 1 && Number(text) <= 65535;
}

//what's wrong, for each kind of ListenError from the Rust listener
function describeError(error, address, port) {
    switch (error.kind) {
        case "inUse":
            return {
                title: `Port ${port} is in use`,
                detail: "Close the other program, or use a multicast address in both.",
            };
        case "notLocal":
            return {
                title: `Can't listen on ${address}`,
                detail: "It must be an address of this computer, or a multicast address.",
            };
        case "invalidAddress":
            return {
                title: `${address} is not a valid address`,
                detail: "Enter an address such as 127.0.0.1.",
            };
        default:
            return {
                title: "Can't listen for WSJT-X",
                detail: error.message ?? "",
            };
    }
}

//the status line in the settings, as { color, title, detail }
export function getConnectionStatus({
    enabled,
    connected,
    error,
    address,
    port,
}) {
    if (!enabled) {
        return {
            color: "gray",
            title: "Off",
            detail: "WSJT-X features are hidden on the dashboard.",
        };
    }

    if (error) {
        return { color: "red", ...describeError(error, address, port) };
    }

    //UDP has no connection, so this means messages are arriving
    if (connected) {
        return {
            color: "green",
            title: "Connected",
            detail: `Receiving from WSJT-X on ${address}:${port}`,
        };
    }

    return {
        color: "orange",
        title: "Waiting for WSJT-X",
        detail: "Check that WSJT-X is running and its UDP server settings match.",
    };
}
