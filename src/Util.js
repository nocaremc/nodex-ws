/**
 * Forces a number to given boundaries if outside them
 * @param {number} value number to constrain
 * @param {number} min 
 * @param {number} max 
 */
clamp = (value, min, max) => {
    
    if(value < min) {
        return min
    }

    if(value > max) {
        return max
    }

    return value
}