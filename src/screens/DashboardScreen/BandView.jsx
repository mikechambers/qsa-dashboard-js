import {Band} from "@/enums/Band"
const getColorForBand = (band) => {
    switch (band?.toUpperCase()) {
        case Band.B2200M: return "#ff1a1a";
        case Band.B630M:  return "#ff4d00";
        case Band.B160M:  return "#ff7a00";
        case Band.B80M:   return "#ffa000";
        case Band.B60M:   return "#ffc800";
        case Band.B40M:   return "#fff000";
        case Band.B30M:   return "#c6ff00";
        case Band.B20M:   return "#1fe85a";
        case Band.B17M:   return "#00ff90";
        case Band.B15M:   return "#00f0e0";
        case Band.B12M:   return "#00d0ff";
        case Band.B10M:   return "#3d9bff";
        case Band.B6M:    return "#6c7dff";
        case Band.B4M:    return "#9b6bff";
        case Band.B2M:    return "#c545ff";
        case Band.B125M:  return "#ff3df2";
        case Band.B70CM:  return "#ff4da6";
        case Band.B33CM:  return "#ff80b0";
        case Band.B23CM:  return "#ffb0d0";
        default:           return "#9fb0c8";
    }
}

export const BandView = ({band}) => {
    return (
        <div className="bandContainer" style={{background: getColorForBand(band)}}>{band}</div>
    );
}