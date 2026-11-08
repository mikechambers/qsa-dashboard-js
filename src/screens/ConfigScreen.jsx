import {TextInput, Button} from "@mantine/core"
import "./ConfigScreen.css"

export default function ConfigScreen(props) {
    return(
        <div id="configScreen" class="screen">
            <div>Config Screen</div>
            <div>
                <TextInput label="callsign" description="callsign" />
                <TextInput label="grid" description="grid" />
                <Button variant="filled">Update</Button>
            </div>

        </div>
    )
}