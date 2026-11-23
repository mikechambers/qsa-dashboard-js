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

import { ActionIcon, Text } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";

import { useSpotData } from "@/contexts/SpotDataContext";
import { SpotTable } from "./table/SpotTable";

import classes from "../DashboardScreen.module.css";

//the spots table, or a tab to open it when it is collapsed
export const SpotsContainer = ({ open, onOpenChange }) => {
    const { filteredSpots } = useSpotData();

    if (!open) {
        return (
            <div className={classes.spotsContainer}>
                <button
                    type="button"
                    className={classes.spotsTab}
                    onClick={() => onOpenChange(true)}
                    aria-label="Open spots table"
                    title="Open spots table"
                >
                    {/* sits where the collapse button is when the table is open */}
                    <ActionIcon
                        component="span"
                        variant="default"
                        size="sm"
                        aria-hidden="true"
                    >
                        <IconChevronLeft
                            size={16}
                            className={classes.spotsTabIcon}
                        />
                    </ActionIcon>
                    <Text
                        size="sm"
                        fw={700}
                        style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                        {filteredSpots.length}
                    </Text>
                    <Text size="sm" c="dimmed" className={classes.spotsTabLabel}>
                        Spots
                    </Text>
                </button>
            </div>
        );
    }

    return (
        <div className={classes.spotsContainer}>
            <SpotTable onCollapse={() => onOpenChange(false)} />
        </div>
    );
};
