import { BandView } from "./BandView";
import { FrequencyView } from "./FrequencyView";


export const BandFrequencyView = ({band, frequency}) => {
    return (
        <div>
            <BandView band={band} />
            <FrequencyView frequency={frequency} />
        </div>
    );
} 