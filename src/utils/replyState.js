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

//how long to give WSJT-X to react to a reply
export const REPLY_WAIT_MS = 4_000;

//what the Reply button should show, from the WSJT-X status. attempt is set
//after the button is clicked: { waiting, error }
export function getReplyState({ call, status, attempt }) {
    const disabled = (reason, label = "Reply") => ({
        enabled: false,
        label,
        reason,
    });

    if (!status) return disabled("Waiting for WSJT-X status.");

    if (status.txEnabled && status.dxCall === call) {
        return disabled(
            status.transmitting ? "Transmitting." : "Waiting on WSJT-X.",
            `Calling ${call}`,
        );
    }

    if (status.transmitting) return disabled("WSJT-X is transmitting.");

    if (status.txEnabled) {
        return disabled(
            status.dxCall
                ? `WSJT-X is working ${status.dxCall}.`
                : "WSJT-X has Tx enabled.",
        );
    }

    if (attempt?.waiting) return disabled("Sending to WSJT-X...");

    //Tx still isn't enabled, so the button can be tried again
    let reason;
    if (attempt?.error) {
        reason = `Could not send: ${attempt.error}`;
    } else if (attempt) {
        reason =
            status.dxCall === call
                ? "Not transmitting. Press Enable Tx in WSJT-X."
                : "No response from WSJT-X. Check that Accept UDP requests is on (Settings > Reporting).";
    }

    return { enabled: true, label: "Reply", reason };
}
