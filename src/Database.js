const log = require('./Log.js')
//const Balances = require('./graphene/Balances.js')
const Asset = require('./graphene/Asset.js')
let map = new WeakMap()

/* Further reading: http://docs.bitshares.org/api/database.html */
class Database {
    /**
     * 
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

        map.get(this).connection.on("message", (data) => {
            this.message(data)
        })
    }

    /**
     * Return the instance id for this api
     */
    get apiID() {
        return map.get(this).api_id
    }

    /**
     * Return an account object by username
     * @param {string} name 
     */
    get_account_by_name(name) {
        map.get(this).connection.request(
            this.apiID,
            map.get(this).event_ids.get_account_by_name,
            "get_account_by_name",
            [name]
        )
    }

    /**
     * Return a list of assets by asset_ids
     * @param {Array} asset_ids 
     */
    get_assets(asset_ids) {
        map.get(this).connection.request(
            this.apiID,
            map.get(this).event_ids.get_assets,
            "get_assets",
            [
                asset_ids
            ]
        )
    }
    
    /**
     * Get a list of assets using a list of symbols
     * @param {array} symbols 
     */
    lookup_asset_symbols(symbols) {
        log.info(map.get(this).storage.getAsset('CNY'))
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
    }

    /**
     * Get limit orders for asset pair
     * @param {string} asset_id_a 
     * @param {string} asset_id_b 
     * @param {int} limit - Maximum of 100, Default 20
     */
    get_limit_orders(asset_id_a, asset_id_b, limit) {
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
    }

    /**
     * Get the ticker price for asset pair
     * @param {string} asset_id_base 
     * @param {string} asset_id_quote 
     */
    get_ticker(asset_id_base, asset_id_quote) {
        map.get(this).connection.request(
            this.apiID,
            map.get(this).event_ids.get_ticker,
            "get_ticker",
            [
                asset_id_base,
                asset_id_quote
            ]
        )
    }

    /**
     * Check account balances
     * @param {string} account_id 
     * @param {array} assets - asset ids
     */
    get_account_balances(account_id, assets) {
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
    }

    message(data) {
        data = JSON.parse(data)
        let events = map.get(this).event_ids

        switch(data.id) {
            case events.get_account_balances:
                //let x = new Balances(data.result)
            break;

            case events.get_assets:
                this.emit('store.assets', data.result)
            break;
        }
    }

    on(event, callback) {
        map.get(this).events.on(event, callback)
    }

    emit(event, data) {
        map.get(this).events.emit(event, data)
    }
}

module.exports = Database