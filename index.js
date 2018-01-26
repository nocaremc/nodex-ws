'use strict'
const dotenv = require('dotenv')
dotenv.load()
const WebSocket = require('ws')
const ws = new WebSocket(process.env.RPC_NODE, {perMessageDeflate: false})

// Based on this bit of simple https://stackoverflow.com/a/41407246
// LATER: create or use a logging library with colors
const colors = {
    reset: "\x1b[0m",
    fgRed: "\x1b[31m",
    fgGreen: "\x1b[32m",
    fgYellow: "\x1b[33m",
    fgWhite: "\x1b[37m"
}

// Print to console log using a color. Revert color after.
function log(error, color)
{
    console.log(color, error, colors.reset)
}

// Print given error to console in red
function logError(error)
{
    log(error, colors.fgRed)
}

// This promise fires sometime after/during the websocket being established
ws.on('open', () => {})

// Shit broke
ws.on('error', logError)

