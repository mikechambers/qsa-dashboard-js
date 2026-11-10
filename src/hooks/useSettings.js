import { useLocalStorage } from '@mantine/hooks';

export function useSettings() {

    //todo: should namespace this? or save as a json obj
    const [callsign, setCallsign] = useLocalStorage({
        key:"callsign",
        defaultValue:"",
        getInitialValueInEffect: false
    });

    const [grid, setGrid] = useLocalStorage({
        key:"grid",
        defaultValue:"",
        getInitialValueInEffect: false
    });

    const settings = {
        grid, callsign
    }

    return [settings, setCallsign, setGrid]
}