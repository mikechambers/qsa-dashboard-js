import {TextInput, Button} from "@mantine/core"
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router'; 

import "./ConfigScreen.css"

export default function ConfigScreen(props) {

    const navigate = useNavigate();

    const isUSCallsign = (callsign) => {
        
        let chars = ["a", "k", "n", "w"];

        for(let c of chars) {
            if(callsign.startsWith(a)) {
                return true
            }
        }

        return false
    }

    const form = useForm({
        initialValues:{
            callsign:"",
            grid:"",
            
            validate: {
            callsign: (callsign) => {

                let msg = "Invalid Callsign"
                if(!callsign) {
                    return msg;
                }

                //US validation is stricter
                let isUS = isUSCallsign(callsign)

                var validUS = false
                if(isUS) {
                    validUS =  /^(?:A[A-L]|K[A-Z]?|N[A-Z]?|W[A-Z]?)[0-9][A-Z]{1,3}$/i.test(callsign)

                    return validUS ? null : msg;
                }

                //if not US, do global validation
                let validGlobal = /^[a-zA-Z0-9]{1,3}[0-9][a-zA-Z0-9]{0,4}[a-zA-Z]$/.test(callsign)

                return validGlobal ? null : msg;
            },


    },
        }
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