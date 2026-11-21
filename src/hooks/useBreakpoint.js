import { Breakpoint } from "@/enums/Breakpoint";
import { useMediaQuery } from "@mantine/hooks";

export const useBreakpoint = () => {
    const isRegularUp = useMediaQuery("(min-width: 48em)");
    const isWideUp = useMediaQuery("(min-width: 75em)");

    if (isWideUp) return Breakpoint.WIDE;
    if (isRegularUp) return Breakpoint.REGULAR;
    return Breakpoint.COMPACT;
};
