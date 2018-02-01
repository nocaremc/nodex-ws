'use strict'
const dotenv = require('dotenv')
const WebSocket = require('ws')

let Events = {
    login: 0,
    db_api: 1,
    get_account_by_name: 2,
    get_account_balances: 3,
    currentRequestID: 10
}

let States = {
    login: false,
    db_api: false,
    account_id: false,
}

let Data = {
    db_api_id: undefined,
    user_id: undefined,
    user_name: undefined,
    user_pass: undefined
}

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

function logWarn(warn)
{
    log(warn, colors.fgYellow)
}

function update(dt)
{
    let request = {}

    // Log in
    if(!States.login) {
        Data.user_name = process.env.DEX_USER
        
        request = {
            id: Events.login,
            method: "call",
            params: [
                1,
                "login",
                [
                    Data.user_name,
                    process.env.DEX_PASS
                ]
            ]
        }

        ws.jsend(request)
        return;
    }

    // Request access to db api
    if(!States.db_api) {
        request = {
            id: Events.db_api,
            method: "call",
            params: [
                1,
                "database",
                []
            ]
        }

        ws.jsend(request)
        return;
    }

    // Obtain user_id for a given username
    if(!States.account_id) {
        request = {
            id: Events.get_account_by_name,
            method: "call",
            params: [
                Data.db_api_id,
                "get_account_by_name",
                [
                    Data.user_name
                ]
            ]
        }
        ws.jsend(request)
        return;
    }

    // Check account balances
    request = {
        id: Events.get_account_balances,
        method: "call",
        params: [
            Data.db_api_id,
            "get_account_balances",
            [
                Data.user_id,
                [] // flat array of asset ids
            ]
        ]
    }

    ws.jsend(request)
}

/**
 * This is function handles/routes every incoming request
 * 
 * @param {String} data - JSON body of incoming blah
 */
function router(data)
{
    data = JSON.parse(data);
    
    switch(data.id)
    {
        case Events.login:
            if(data.result === true) {
                log("Logged in", colors.fgGreen)
                States.login = true
            } else {
                logError("Unable to login!")
            }
        break;

        case Events.db_api:
            Data.db_api_id = data.result
            log("Database API ID: " + Data.db_api_id, colors.fgGreen)
            States.db_api = true
        break;
        
        case Events.get_account_by_name:
            Data.user_id = data.result.id
            log("Got account for: " + Data.user_name + ' | ' + Data.user_id, colors.fgGreen)
            // We can extract a whole lot more data about this account here
            // logError(data)
            States.account_id = true
        break;

        case Events.get_account_balances:
            // We'll need a lookup list of these assets to know what they are.
            // AND these values look incorrect for my account.. 0.o
            log("Got balance info for: " + Data.user_id, colors.fgGreen)
            // logWarn(data.result)
        break;

        default:
            logError("Unknown event given: ")
            logWarn(data)
        break;
    }

    setTimeout(update, 1000)
}

/* Startup */

// Load environment variables
dotenv.load()

// Establish a connection with the given node address
let ws = new WebSocket(process.env.RPC_NODE, {perMessageDeflate: false})

// Proxy WS' send function to json-encode given data before sending
// Could be something in that library that already can do this.
ws.jsend = request => {
    ws.send(JSON.stringify(request))
}

// A socket connection is established
ws.on('open', update)

// A message was recieved on socket connection
ws.on('message', router)

// WS threw an error back at us
ws.on('error', logError)