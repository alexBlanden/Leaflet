function convertPopulationToString(number) {
    const string = number.toString()
    const length = string.length
    if(length < 7){
        return number
    } else if(length == 7){
        return(`${string[0]} million`)
    } else if(length == 8){
        return(`${string[0]}${string[1]} million`)
    } else if(length == 9){
    return(`${string[0]}${string[1]}${string[2]} million`)
    } else if(length > 9){
    return(`${string[0]}.${string[1]} billion`)
    }
}

export {
    convertPopulationToString
}