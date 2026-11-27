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

import { Stack, Text, Group, Box, ColorSwatch } from "@mantine/core";
import classes from "./PodBase.module.css";

//one stat. compact lays it out on one line, for the collapsed summary bar
export const SummaryBase = ({
    value,
    unit,
    label,
    subvalue,
    footer, //shown in place of subvalue
    swatchColor,
    onClick,
    useMonospace,
    compact,
    compactSubvalue, //shorter text for the compact layout
    title,
}) => {
    const style = { cursor: onClick ? "pointer" : "auto" };

    const ff = useMonospace ? "monospace" : undefined;

    const c = () => {
        if (onClick) onClick();
    };
    //a button when it does something, so a click on it doesn't count as a
    //click on the bar around it
    if (compact) {
        return (
            <Box
                component={onClick ? "button" : "span"}
                type={onClick ? "button" : undefined}
                className={classes.compact}
                title={title}
                onClick={onClick}
            >
                {swatchColor && (
                    <ColorSwatch
                        component="span"
                        color={swatchColor}
                        size={8}
                    />
                )}
                {label && <span className={classes.dimmed}>{label}</span>}
                <Text span size="sm" fw={600} ff={ff}>
                    {value ?? "-"}
                    {unit && ` ${unit}`}
                </Text>
                {compactSubvalue && (
                    <span className={classes.dimmed}>{compactSubvalue}</span>
                )}
                {footer}
            </Box>
        );
    }

    return (
        <Box onClick={() => c()} style={style} title={title}>
            <Stack gap={4}>
                <Text size="xs" tt="uppercase" lts={0.5}>
                    {label}
                </Text>
                <Group gap={4} wrap="nowrap" align="baseline">
                    {swatchColor && (
                        <ColorSwatch
                            color={swatchColor}
                            size={8}
                            style={{ transform: "translateY(-3px)" }}
                        />
                    )}

                    <Text fz={{ base: 20, sm: 26 }} fw={600} lh={1.1} ff={ff}>
                        {value ?? "-"}
                    </Text>
                    {unit && (
                        <Text size="sm" fw={500} c="dimmed">
                            {unit}
                        </Text>
                    )}
                </Group>
                {footer ?? (
                    <Text size="xs" c="dimmed">
                        {subvalue}
                    </Text>
                )}
            </Stack>
        </Box>
    );
};
