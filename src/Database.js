/* Further reading: http://docs.bitshares.org/api/database.html */
class Database {
    
    /**
     * describe me
     * @param {string} name 
     */
    get_account_by_name(name) {}
    
    /**
     * Get a list of assets using a list of symbols
     * @param {array} symbols 
     */
    lookup_asset_symbols(symbols){}

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
    }

    /**
     * Get the ticker price for asset pair
     * @param {string} asset_id_base 
     * @param {string} asset_id_quote 
     */
    get_ticker(asset_id_base, asset_id_quote) {

    }

    /**
     * 
     * @param {string} account_id 
     * @param {array} assets - asset ids
     */
    get_account_balances(account_id, assets) {

    }
}

module.exports = Database