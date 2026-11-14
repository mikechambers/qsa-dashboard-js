import { Badge } from "@mantine/core";

export const ModeView = ({ mode }) => {
    return (
        <Badge size="md" variant="light" radius="md" fw={600} color="gray">
            {mode}
        </Badge>
    );
};
