/**
 * Forces a number to given boundaries if outside them
 * @param {number} min 
 * @param {number} max 
 */
Number.prototype.clamp = (min, max) => {
    if(typeof this !== "number") {
        return min
    }

    if(this < min) {
        return min
    }

    if(this > max) {
        return max
    }

    return this
}