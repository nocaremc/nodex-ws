const log = require('./Log.js')

let map = new WeakMap()

/* Further reading: http://docs.bitshares.org/api/database.html */
class Database {
    
    constructor(api_id, connection, eventEmitter) {
        map.set(this, {
            api_id: api_id,
            connection: connection,
            events: eventEmitter,
            // These can be scoped into a range unique to this api
            // api_id + range + id
            // eh
            event_ids: {
                get_account_by_name: 1000 + 1,
                lookup_asset_symbols: 1000 + 2,
                get_limit_orders: 1000 + 3,
                get_ticker: 1000 + 4,
                get_account_balances: 1000 + 5,
            }
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
     * describe me
     * @param {string} name 
     */
    get_account_by_name(name) {
        let request = map.get(this).connection
            .buildRequest(
                this.apiID,
                map.get(this).event_ids.get_account_by_name,
                "get_account_by_name",
                [name]
            )

        map.get(this).connection.send(request)
    }
    
    /**
     * Get a list of assets using a list of symbols
     * @param {array} symbols 
     */
    lookup_asset_symbols(symbols){
        let request = map.get(this).connection
            .buildRequest(
                this.apiID,
                map.get(this).event_ids.lookup_asset_symbols,
                "lookup_asset_symbols",
                [
                    JSON.parse(symbols)
                ]
            )

        map.get(this).connection.send(request)
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

        let request = map.get(this).connection
            .buildRequest(
                this.apiID,
                map.get(this).event_ids.get_limit_orders,
                "get_limit_orders",
                [
                    asset_id_a,
                    asset_id_b,
                    limit
                ]
            )

        map.get(this).connection.send(request)
    }

    /**
     * Get the ticker price for asset pair
     * @param {string} asset_id_base 
     * @param {string} asset_id_quote 
     */
    get_ticker(asset_id_base, asset_id_quote) {
        let request = map.get(this).connection
            .buildRequest(
                this.apiID,
                map.get(this).event_ids.get_ticker,
                "get_ticker",
                [
                    asset_id_base,
                    asset_id_quote
                ]
            )

        map.get(this).connection.send(request)
    }

    /**
     * Check account balances
     * @param {string} account_id 
     * @param {array} assets - asset ids
     */
    get_account_balances(account_id, assets) {
        // error check asset ids
        let request = map.get(this).connection
            .buildRequest(
                this.apiID,
                map.get(this).event_ids.get_account_balances,
                "get_account_balances",
                [
                    account_id,
                    assets
                ]
            )

        map.get(this).connection.send(request)
    }

    message(data) {
        data = JSON.parse(data)
        //log.warn(data.id)
        switch(data.id) {}
    }

    on(event, callback) {
        map.get(this).events.on(event, callback)
    }

    emit(event, data) {
        map.get(this).events.emit(event, data)
    }
}

module.exports = Database