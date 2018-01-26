'use strict'
const dotenv = require('dotenv')
const WebSocket = require('ws')

/**
 * Based on this bit of simple https://stackoverflow.com/a/41407246
 * LATER: create or use a logging library with colors
 */
const colors = {
    reset: "\x1b[0m",
    fgRed: "\x1b[31m",
    fgGreen: "\x1b[32m",
    fgYellow: "\x1b[33m",
    fgWhite: "\x1b[37m"
}

// Print to console log using a color. Revert color after.
function log(message, color)
{
    if(typeof color === 'undefined') {
        color = colors.fgWhite
    }

    console.log(color, message, colors.reset)
}

// Print given error to console in red
function logError(error)
{
    log(error, colors.fgRed)
}

/* Let's begin */
function init()
{
    let ws = new WebSocket(process.env.RPC_NODE, {perMessageDeflate: false})
    ws.requestID = 0;
    
    // This promise fires sometime after/during the websocket being established
    ws.on('open', () => {
        
        // Log in our account
        let request = JSON.stringify({
            id: ws.requestID++,
            method: "call",
            params: [
                1,
                "login",
                [process.env.USER, process.env.PASS]
            ]
        });

        ws.send(request)
        
    })

    ws.on('message', data => {
        log(data)
    })

    // Shit broke
    ws.on('error', logError)
}

// Load environment variables
dotenv.load()

// Start
init()