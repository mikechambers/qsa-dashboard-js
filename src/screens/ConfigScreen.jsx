import {TextInput, Button} from "@mantine/core"
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router'; 
import {isValidCallsign, normalizeCallsign} from "@/utils/radio"

import "./ConfigScreen.css"

export default function ConfigScreen(props) {

    const navigate = useNavigate();

    const form = useForm({
        initialValues:{
            callsign:"",
            grid:"",
        },
        validate: {
            callsign: (callsign) => {
                let c = normalizeCallsign(callsign)
                return isValidCallsign(c) ? null : "Invalid Callsign"
            },

        },
    })

    const onUpdateClick = (props) => {
        console.log("click")
        navigate("/dashboard/a/b/")
    }

    return(
        <div id="configScreen" className="screen">
            <div>Config Screen</div>
            <form onSubmit={form.onSubmit(onUpdateClick)}>
                <TextInput label="callsign" description="callsign" key={form.key('callsign')} {...form.getInputProps('callsign')} />
                <TextInput label="grid" description="grid" key={form.key('grid')} {...form.getInputProps('grid')} />
                <Button type="submit" variant="filled">Update</Button>
            </form>

        </div>
    )
}