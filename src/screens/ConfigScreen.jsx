import {TextInput, Button} from "@mantine/core"
import { useForm } from '@mantine/form';
//import { useLocalStorage } from '@mantine/hooks';
import { useSettings } from "../context/SettingsContext";

import { useNavigate } from 'react-router'; 
import {isValidCallsign, isValidMaidenHeadGrid} from "@/utils/radio"

import "./ConfigScreen.css"

export default function ConfigScreen(props) {

    const navigate = useNavigate();

    const {settings, setCallsign, setGrid} = useSettings()

    const form = useForm({
        initialValues:{
            callsign:settings.callsign,
            grid:settings.grid,
        },
        validate: {
            callsign: (callsign) => {
                return isValidCallsign(callsign.trim()) ? null : "Invalid Callsign"
            },
            grid: (grid) => {
                let o = isValidMaidenHeadGrid(grid.trim())
                console.log(grid, o)

                return o ? null : "Invalid Maidenhead Grid"
            },
        },
    })

    const onUpdateClick = (props) => {

        const c = encodeURIComponent(props.callsign);
        const g = encodeURIComponent(props.grid);

        setCallsign(props.callsign);
        setGrid(props.grid);

        navigate(`/dashboard/${c}/${g}/`)
    }

    return(
        <div id="configScreen" className="screen">
          
            <form onSubmit={form.onSubmit(onUpdateClick)}>
                <TextInput placeholder="callsign" key={form.key('callsign')} {...form.getInputProps('callsign')} />
                <TextInput placeholder="grid" key={form.key('grid')} {...form.getInputProps('grid')} />
                <Button type="submit" variant="filled">Update</Button>
            </form>

        </div>
    )
}