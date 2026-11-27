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

import { Anchor, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

//created by npm run licenses
const LICENSES_URL = `${import.meta.env.BASE_URL}third-party-licenses.txt`;

const loadLicenses = async () => {
    const response = await fetch(LICENSES_URL);

    //a missing file can come back as the app's index.html
    if (
        !response.ok ||
        !response.headers.get("content-type")?.startsWith("text/plain")
    ) {
        throw new Error(`Could not load ${LICENSES_URL}`);
    }

    return response.text();
};

//a link that shows the license notices. In a dialog, so it works the same in
//the web and desktop apps
export const ThirdPartyLicenses = () => {
    const [opened, { open, close }] = useDisclosure(false);
    const [text, setText] = useState(null);

    //only loaded when asked for, as it is large
    const show = async () => {
        open();

        try {
            setText(await loadLicenses());
        } catch (error) {
            console.error(error);
            setText("The license file could not be loaded.");
        }
    };

    return (
        <>
            <Anchor component="button" type="button" ta="left" onClick={show}>
                Third-party licenses
            </Anchor>

            <Modal
                opened={opened}
                onClose={close}
                title="Third-party licenses"
                size="xl"
            >
                <Text
                    component="pre"
                    fz="xs"
                    ff="monospace"
                    style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                >
                    {text ?? "Loading…"}
                </Text>
            </Modal>
        </>
    );
};
