//Based on this https://stackoverflow.com/a/41407246
const colors = {
    reset: "\x1b[0m",
    fgRed: "\x1b[31m",
    fgGreen: "\x1b[32m",
    fgYellow: "\x1b[33m",
    fgWhite: "\x1b[37m"
}

class Log {
    static log(message, color) {
        if(!color) {
            color = colors.reset
        }

        console.log(color, message, colors.reset)
    }

    static info(message) {
        this.log(message)
    }

    static warn(message) {
        this.log(message, colors.fgYellow)
    }

    static error(message) {
        this.log(message, colors.fgRed)
    }

    static success(message) {
        this.log(message, colors.fgGreen)
    }
}

module.exports = Log