import {Band} from "@/enums/Band"
import { Badge } from "@mantine/core";

//need to add custom colors within mantine
//https://mantine.dev/theming/colors/
export const getColorForBand = (band) => {
    switch (band?.toUpperCase()) {
        case Band.B2200M: return "red";
        case Band.B630M:  return "red";
        case Band.B160M:  return "orange";
        case Band.B80M:   return "orange";
        case Band.B60M:   return "yellow";
        case Band.B40M:   return "yellow";
        case Band.B30M:   return "lime";
        case Band.B20M:   return "green";
        case Band.B17M:   return "teal";
        case Band.B15M:   return "cyan";
        case Band.B12M:   return "blue";
        case Band.B10M:   return "indigo";
        case Band.B6M:    return "violet";
        case Band.B4M:    return "violet";
        case Band.B2M:    return "grape";
        case Band.B125M:  return "grape";
        case Band.B70CM:  return "pink";
        case Band.B33CM:  return "pink";
        case Band.B23CM:  return "pink";
        default:          return "gray";
    }
}

export const BandView = ({band}) => {
    return (
       <Badge radius="md" variant="light" color={getColorForBand(band)}>{band}</Badge>
    );
}



// <div className="bandContainer" style={{background: getColorForBand(band)}}>{band}</div>