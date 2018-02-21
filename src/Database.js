const log = require('./Log.js')
//const Balances = require('./graphene/Balances.js')
const Asset = require('./graphene/Asset.js')
let map = new WeakMap()

/* Further reading: http://docs.bitshares.org/api/database.html */
class Database {
    
    /**
     * @param {integer} api_id 
     * @param {Connection} connection 
     * @param {EventEmitter} eventEmitter 
     * @param {DataStore} storage 
     */
    constructor(api_id, connection, eventEmitter, storage) {
        map.set(this, {
            api_id: api_id,
            connection: connection,
            events: eventEmitter,
            storage: storage,
            // These can be scoped into a range unique to this api
            // api_id + range + id
            // eh, could be something wiser in place
            event_ids: {
                get_account_by_name: 1000 + 1,
                lookup_asset_symbols: 1000 + 2,
                get_assets: 1000 + 3,
                get_limit_orders: 1000 + 4,
                get_ticker: 1000 + 5,
                get_account_balances: 1000 + 6,
            },
        })

        // Handle incoming websocket messages in this class
        map.get(this).connection.on("message", data => this.message(data))
    }

    /**
     * Return the API ID given for this instance
     */
    get apiID() {
        return map.get(this).api_id
    }

    /**
     * Return an account object by username
     * @param {string} name account name
     * @param {function} callback 
     */
    get_account_by_name(name, callback) {
        map.get(this).connection.request(
            this.apiID,
            map.get(this).event_ids.get_account_by_name,
            "get_account_by_name",
            [name]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_account_by_name", callback)
        }
    }

    /**
     * Return a list of assets by asset_ids
     * @param {Array} asset_ids 
     * @param {function} callback 
     */
    get_assets(asset_ids, callback) {
        map.get(this).connection.request(
            this.apiID,
            map.get(this).event_ids.get_assets,
            "get_assets",
            [
                asset_ids
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_assets", callback)
        }
    }
    
    /**
     * Get a list of assets using a list of symbols
     * @param {array} symbols array asset symbol names
     * @param {function} callback 
     */
    lookup_asset_symbols(symbols, callback) {
        // We could/should check local asset collection first.
        // Then we could build and emit a replica locally
        map.get(this).connection.request(
            this.apiID,
            map.get(this).event_ids.lookup_asset_symbols,
            "lookup_asset_symbols",
            [
                JSON.parse(symbols)
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.lookup_asset_symbols", callback)
        }
    }

    /**
     * Get limit orders for asset pair
     * @param {string} asset_id_a 
     * @param {string} asset_id_b 
     * @param {int} limit - Maximum of 100, Default 20
     * @param {function} callback 
     */
    get_limit_orders(asset_id_a, asset_id_b, limit, callback) {
        if(typeof limit === 'undefined') {
            limit = 20
        }

        map.get(this).connection.request(
            this.apiID,
            map.get(this).event_ids.get_limit_orders,
            "get_limit_orders",
            [
                asset_id_a,
                asset_id_b,
                limit
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_limit_orders", callback)
        }
    }

    /**
     * Get the ticker price for asset pair
     * @param {string} asset_id_base 
     * @param {string} asset_id_quote 
     * @param {function} callback 
     */
    get_ticker(asset_id_base, asset_id_quote, callback) {
        map.get(this).connection.request(
            this.apiID,
            map.get(this).event_ids.get_ticker,
            "get_ticker",
            [
                asset_id_base,
                asset_id_quote
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_ticker", callback)
        }
    }

    /**
     * Check account balances
     * @param {string} account_id 
     * @param {array} assets - asset ids
     * @param {function} callback 
     */
    get_account_balances(account_id, assets, callback) {
        // LATER: error check asset ids... as a start
        map.get(this).connection.request(
            this.apiID,
            map.get(this).event_ids.get_account_balances,
            "get_account_balances",
            [
                account_id,
                assets
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_account_balances", callback)
        }
    }

    /**
     * Handles incoming websocket responses related to database api
     * @param {string} data response data as JSON string
     */
    message(data) {
        data = JSON.parse(data)
        let events = map.get(this).event_ids

        switch(data.id) {
            case events.get_account_balances:
                //let x = new Balances(data.result)
                this.emit("db.get_account_balances", data.result)
            break;

            case events.get_assets:
                // After assets have been stored, we'll pass the stored assets
                // back to get_assets
                this.once('store.assets.stored', (assets) => {
                    this.emit('db.get_assets', assets)
                })

                // Store retrieved assets
                this.emit('store.assets', data.result)
            break;


            case events.get_account_by_name:
                this.emit("db.get_account_by_name", data.result)
            break;

            case events.lookup_asset_symbols:
                this.emit("db.lookup_asset_symbols", data.result)
            break;

            case events.get_limit_orders:
                this.emit("db.get_limit_orders", data.result)
            break;

            case events.get_ticker:
                this.emit("db.get_ticker", data.result)
            break;


        }
    }

    /**
     * Attach an event to EventEmitter 
     * @param {string} event event name
     * @param {function} callback 
     */
    on(event, callback) {
        map.get(this).events.on(event, callback)
    }

    /**
     * Attach a event to EventEmitter to be fired only once
     * @param {string} event event name
     * @param {function} callback 
     */
    once(event, callback) {
        map.get(this).events.once(event, callback)
    }

    /**
     * Emit an event using EventEmitter
     * @param {string} event event name
     * @param {anything} data 
     */
    emit(event, data) {
        map.get(this).events.emit(event, data)
    }
}

module.exports = Database