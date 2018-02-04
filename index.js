'use strict'
const dotenv = require('dotenv')
const WebSocket = require('ws')

let Events = {
    login: 0,
    db_api: 1,
    get_account_by_name: 2,
    get_account_balances: 3,
    lookup_asset_symbols: 4,
    get_limit_orders: 5,
    get_ticker: 6,
    currentRequestID: 100
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
    /* array {
        id,
        asset_pair_id,
        orders: [{
            id,
            quantity,
            // NOW: Just run the math for this upon collection
            price: {
                base: {amount, asset_id},
                quote: {amount, asset_id}
            }
        }]
    } */
    orders: []
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
        // Do not pair onself
        .filter(item => symbol !== item)
        // get pairs
        .map(item => [symbol, item])
}

/**
 * Returns true if a given order's id matches the current get_limit_order event
 * @param {Order} item 
 */
function getOrderByEventID(item)
{
    return item.id === Events.get_limit_orders + Events.currentRequestID
}

/**
 * Returns a subset of information in an order from rpc
 * @param {Order Object} order 
 */
function mapOrderData(order)
{
    return {
        id: order.id,
        quantity: order.for_sale,
        price: order.sell_price
    }
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
    
    /* Get limit orders for an asset *
    /* This example will get the first 20 orders for the first asset pair *
    
    // Our id serves as the request incrementer + event id base
    // This is how we uniquely identify it in the router
    Events.currentRequestID = Events.currentRequestID + 1
    let unique_id = Events.get_limit_orders + Events.currentRequestID
    // We'll want to referance this specific order collection later
    Data.orders.push({id: unique_id, asset_pair_key: 0})
    
    request = {
        id: unique_id,
        method: "call",
        params: [
            Data.db_api_id,
            "get_limit_orders",
            [
                Data.asset_pairs[0][0].id,
                Data.asset_pairs[0][1].id,
                20
            ]
        ]
    }
    ws.jsend(request)
    return;*/

    /* Send money to another account *
    request = {
        id: Events.
    }*/

    /* Get ticker price for a pair
    Events.currentRequestID = Events.currentRequestID + 1
    let ticker_id = Events.get_ticker + Events.currentRequestID
    request = {
        id: ticker_id,
        method: "call",
        params: [
            Data.db_api_id,
            "get_ticker",
            [
                Data.asset_pairs[0][0].id,
                Data.asset_pairs[0][1].id,
            ]
        ]
    }
    ws.jsend(request)
    return;*/

    logError("Quitting")
    ws.close()

    /* Check account balances
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
            
            // We'll iterate to create pairs and remove used (first) item each time
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
            //logWarn(Data.asset_pairs)
        break;
        
        // The most recent get_limit_order request response
        case (Events.get_limit_orders + Events.currentRequestID):
            let orders = data.result
            Data.orders
                // Get the order that matches this event
                .filter(getOrderByEventID)
                .map(item => {
                    // Collect the desired data we want for each order
                    item.orders = orders.map(mapOrderData)
                })
            log("Collected Orders for asset: " + Data.orders.filter(getOrderByEventID)[0].asset_pair_key, colors.fgGreen)
            /* likely a bug on my end. Either multiply value by 10 or divide by 10
            let price = Data.orders[0].orders[0].price
            let key = Data.orders.filter(getOrderByEventID)[0].asset_pair_key
            let pair = Data.asset_pairs[key]
            logError(pair[0].symbol + pair[1].symbol + ": " +(price.quote.amount/price.base.amount)*10)
            */
        break;

        // Ticker price data 
        case (Events.get_ticker + Events.currentRequestID):
            logWarn(data)
        break;

        default:
            logError("Unknown event given: " + data.id + " " + (Events.get_limit_orders + Events.currentRequestID))
            logError(data)
        break;
    }

    setTimeout(update, 250)
}

/* Startup */

// Load environment variables
dotenv.load()

// Establish a connection with the given node address
let ws = new WebSocket(process.env.RPC_NODE, {perMessageDeflate: false})

// Proxy WS' send function to json-encode given data before sending
// Could be something in that library that already can do this.
ws.jsend = request => ws.send(JSON.stringify(request))

// A socket connection is established
ws.on('open', update)

// A message was recieved on socket connection
ws.on('message', router)

// WS threw an error back at us
ws.on('error', logError)