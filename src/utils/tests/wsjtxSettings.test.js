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

import { describe, expect, it } from "vitest";
import {
    getConnectionStatus,
    isValidAddress,
    isValidPort,
} from "../wsjtxSettings";

describe("isValidAddress", () => {
    it("accepts direct and multicast addresses", () => {
        expect(isValidAddress("127.0.0.1")).toBe(true);
        expect(isValidAddress(" 224.0.0.1 ")).toBe(true);
        expect(isValidAddress("0.0.0.0")).toBe(true);
    });

    it("rejects anything else", () => {
        for (const bad of [
            "",
            "localhost",
            "127.0.0",
            "256.0.0.1",
            "01.0.0.1",
        ]) {
            expect(isValidAddress(bad)).toBe(false);
        }
    });
});

describe("isValidPort", () => {
    it("accepts 1 to 65535", () => {
        expect(isValidPort("2237")).toBe(true);
        expect(isValidPort(65535)).toBe(true);
    });

    it("rejects anything else", () => {
        for (const bad of ["", "0", "65536", "22.5", "-1", "abc"]) {
            expect(isValidPort(bad)).toBe(false);
        }
    });
});

describe("getConnectionStatus", () => {
    const base = {
        enabled: true,
        connected: false,
        error: null,
        address: "127.0.0.1",
        port: 2237,
    };

    it("is off when turned off, whatever else is true", () => {
        const status = getConnectionStatus({
            ...base,
            enabled: false,
            connected: true,
        });
        expect(status.title).toBe("Off");
    });

    it("waits until messages arrive", () => {
        expect(getConnectionStatus(base).title).toBe("Waiting for WSJT-X");
        expect(getConnectionStatus({ ...base, connected: true }).title).toBe(
            "Connected",
        );
    });

    it("says why it isn't listening", () => {
        const inUse = getConnectionStatus({
            ...base,
            error: { kind: "inUse" },
        });
        expect(inUse).toMatchObject({
            color: "red",
            title: "Port 2237 is in use",
        });

        const other = getConnectionStatus({
            ...base,
            error: { kind: "other", message: "no network" },
        });
        expect(other.detail).toBe("no network");
    });
});
