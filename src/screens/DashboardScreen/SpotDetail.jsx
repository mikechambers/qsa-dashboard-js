import { TimeView } from "./TimeView";

export const SpotDetail = ({ spot }) => {

    if(!spot) {
        return null;
    }

    return (
        <div id="spotDetail">
            <div>{spot?.receiverCall}</div>
            <div>{spot?.band}</div>

            <div><TimeView date={spot?.time} /></div>
            <div></div>

            <div>{spot?.distance}</div>
            <div>{spot?.snr}</div>

            <div>{spot?.frequency}</div>
            <div>{spot?.mode}</div>
        </div>
    );
};
