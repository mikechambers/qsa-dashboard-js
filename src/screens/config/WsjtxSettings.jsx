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

import { useState } from "react";
import {
    Box,
    Button,
    Divider,
    Fieldset,
    Group,
    Stack,
    Switch,
    Text,
    TextInput,
} from "@mantine/core";
import { useSettings } from "@/contexts/SettingsContext";
import { useWsjtx } from "@/contexts/WsjtxContext";
import {
    getConnectionStatus,
    isValidAddress,
    isValidPort,
} from "@/utils/wsjtxSettings";

//the connection to WSJT-X. Desktop only. The switch applies right away, but the
//address and port only on the button, to not reconnect on every keystroke
export const WsjtxSettings = () => {
    const { settings, setWsjtxEnabled, setWsjtxAddress, setWsjtxPort } =
        useSettings();
    const { connected, error, retry } = useWsjtx();

    const { wsjtxEnabled: enabled } = settings;
    const [address, setAddress] = useState(settings.wsjtxAddress);
    const [port, setPort] = useState(String(settings.wsjtxPort));
    const [errors, setErrors] = useState({});

    const changed =
        address.trim() !== settings.wsjtxAddress ||
        port.trim() !== String(settings.wsjtxPort);
    const canRetry = !changed && Boolean(error);

    const apply = () => {
        if (!enabled) return;
        if (canRetry) return retry();
        if (!changed) return;

        const next = {
            address: isValidAddress(address) ? null : "Invalid address",
            port: isValidPort(port) ? null : "Port must be 1 to 65535",
        };
        setErrors(next);
        if (next.address || next.port) return;

        setAddress(address.trim());
        setPort(String(Number(port)));
        setWsjtxAddress(address.trim());
        setWsjtxPort(Number(port));
    };

    //these are inside the station form, which Enter would otherwise submit
    const onKeyDown = (e) => {
        if (e.key !== "Enter") return;

        e.preventDefault();
        apply();
    };

    const status = getConnectionStatus({
        enabled,
        connected,
        error,
        address: settings.wsjtxAddress,
        port: settings.wsjtxPort,
    });

    return (
        <Fieldset legend="WSJT-X">
            <Stack gap="md">
                <Switch
                    label="Connect to WSJT-X"
                    labelPosition="left"
                    checked={enabled}
                    onChange={(e) => setWsjtxEnabled(e.currentTarget.checked)}
                    styles={{
                        body: { justifyContent: "space-between" },
                    }}
                />

                <TextInput
                    label="Address"
                    description="Direct or multicast"
                    disabled={!enabled}
                    value={address}
                    error={errors.address}
                    onChange={(e) => {
                        setAddress(e.currentTarget.value);
                        setErrors((prev) => ({ ...prev, address: null }));
                    }}
                    onKeyDown={onKeyDown}
                />

                <TextInput
                    label="Port"
                    description="Must match the UDP server port in WSJT-X."
                    inputMode="numeric"
                    disabled={!enabled}
                    value={port}
                    error={errors.port}
                    onChange={(e) => {
                        setPort(e.currentTarget.value);
                        setErrors((prev) => ({ ...prev, port: null }));
                    }}
                    onKeyDown={onKeyDown}
                />

                <Button
                    type="button"
                    variant="filled"
                    disabled={!enabled || (!changed && !canRetry)}
                    onClick={apply}
                >
                    {canRetry ? "Retry" : "Update connection"}
                </Button>

                <Divider />

                <Group gap="xs" wrap="nowrap" align="flex-start" role="status">
                    <Box
                        w={10}
                        h={10}
                        mt={4}
                        bg={`${status.color}.6`}
                        style={{ borderRadius: "50%", flex: "none" }}
                        aria-hidden="true"
                    />
                    <Stack gap={2}>
                        <Text size="sm" fw={600}>
                            {status.title}
                        </Text>
                        <Text size="xs" c="dimmed">
                            {status.detail}
                        </Text>
                    </Stack>
                </Group>
            </Stack>
        </Fieldset>
    );
};
