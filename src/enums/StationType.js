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

//what a station on the map or in the detail card is doing
const StationTypes = {
    CQ: "CQ", //calling anyone (WSJT-X)
    HEARD: "HEARD", //any other station we decode (WSJT-X)
    SPOT: "SPOT", //heard our signal (PSK Reporter)
};

export const StationType = Object.freeze({
    ...StationTypes,
});

//what the UI calls each type, in the order they are listed
export const STATION_TYPE_INFO = Object.freeze({
    [StationType.SPOT]: {
        name: "Spot",
        plural: "Spots",
        description: "Spots (heard you)",
        phrase: "Heard your signal",
    },
    [StationType.HEARD]: {
        name: "Heard",
        plural: "Heard",
        description: "Heard (you hear them)",
    },
    [StationType.CQ]: {
        name: "CQ",
        plural: "CQ",
        description: "Calling CQ",
        phrase: "Calling anyone",
        //used when there is a tag such as POTA, to leave room for it
        taggedPhrase: "Calling",
    },
});

export const STATION_TYPE_LIST = Object.freeze(Object.keys(STATION_TYPE_INFO));
