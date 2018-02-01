'use strict'
const dotenv = require('dotenv')
const WebSocket = require('ws')

let Events = {
    login: 0,
    db_api: 1,
    get_account_by_name: 2,
    get_account_balances: 3,
    lookup_asset_symbols: 4,
    currentRequestID: 10
}

let States = {
    login: false,
    db_api: false,
    account_id: false,
    asset_list: false,
}

let Data = {
    // integer|string
    db_api_id: undefined,
    // string
    user_id: undefined,
    // string
    user_name: undefined,
    // string
    user_pass: undefined,
    // array {asset}
    asset_list: [],
    // array {id, symbol}
    asset_pairs: [],
}

/**
 * Based on this https://stackoverflow.com/a/41407246
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

/**
 * Return all symbols in given list paired with given symbol
 * @param {String} symbol 
 * @param {Array} list 
 */
function makePairs(symbol, list)
{
    return list
        .filter(item => symbol !== item)
        .map(item => [symbol, item])
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

    // Let's grab a list of assets we care about
    if(!States.asset_list) {
        request = {
            id: Events.lookup_asset_symbols,
            method: "call",
            params: [
                Data.db_api_id,
                "lookup_asset_symbols",
                [
                    JSON.parse(process.env.ASSET_SYMBOLS)
                ]
            ]
        }
        ws.jsend(request)
        return;
    }

    logError("Quitting")
    ws.close()
    /*
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

    ws.jsend(request)*/
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
            States.db_api = true
            log("Database API ID: " + Data.db_api_id, colors.fgGreen)
        break;
        
        case Events.get_account_by_name:
            Data.user_id = data.result.id
            // We can extract a whole lot more data about this account here
            // logError(data)
            States.account_id = true
            log("Got account for: " + Data.user_name + ' | ' + Data.user_id, colors.fgGreen)
        break;

        case Events.get_account_balances:
            // We'll need a lookup list of these assets to know what they are.
            // AND these values look incorrect for my account.. 0.o
            log("Got balance info for: " + Data.user_id, colors.fgGreen)
            // logWarn(data.result)
        break;

        case Events.lookup_asset_symbols:
            Data.asset_list = data.result;
            log("Retrieved desired assets list", colors.fgGreen)

            // Simplify asset list. We don't all the much data in pairs
            let list = Data.asset_list.map(item => {
                return {symbol: item.symbol, id: item.id}
            })
            
            do {
                let symbol_pairs = makePairs(list[0], list)
                
                if(symbol_pairs.length > 0) {
                    Data.asset_pairs.push(symbol_pairs)
                }

                // Remove current symbol from list
                list.splice(0, 1)
            }
            while (list.length > 0)
            
            // Flatten the array of pairs
            Data.asset_pairs = [].concat(...Data.asset_pairs)
            States.asset_list = true
            log("Created asset pairs", colors.fgGreen)
        break;

        default:
            logError("Unknown event given: " + data.id)
            logError(data)
        break;
    }

    setTimeout(update, 500)
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