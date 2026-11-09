
export const normalizeCallsign = (callsign) => {

    if(typeof callsign !== "string") {
        return ""
    }

    return callsign.toUpperCase().trim()
}

export const isUSCallsign = (callsign) => {
    
    if(typeof callsign !== 'string') {
        return false
    }

     //ai helped with the regex
    return /^(?:A[A-L]|[KNW])/i.test(callsign)
}

export const isValidCallsign = (callsign) => {
    if(isUSCallsign(callsign)) {
        return isValidUSCallsign(callsign)
    } else {
        return isValidGlobalCallsign(callsign)
    }
}

export const isValidUSCallsign = (callsign) => {
     //ai helped with the regex
    return /^(?:[KNW][0-9][A-Z]{2,3}|(?:A[A-L]|[KNW][A-Z])[0-9][A-Z]{1,3})$/i.test(callsign)
}

export const isValidGlobalCallsign = (callsign) => {

    //ai helped with the regex
    return /^(?:[A-Z]{1,2}|[A-Z][0-9]|[0-9][A-Z])[0-9][A-Z]{1,3}$/i.test(callsign)
}
