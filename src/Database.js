const log = require('./Log.js')
//const Balances = require('./graphene/Balances.js')
const Asset = require('./graphene/Asset.js')
let map = new WeakMap()

function createEventIds(api_event_id, seed, events) {
    let ids = {}
    events.map(name => {
        ids[name] = api_event_id + seed++
    })

    return ids
}

/* Further reading: http://docs.bitshares.org/api/database.html */
class Database {
    
    /**
     * @param {integer} api_id 
     * @param {Connection} connection 
     * @param {EventEmitter} eventEmitter 
     * @param {DataStore} storage 
     */
    constructor(api_id, connection, eventEmitter, storage) {
        let api_event_id = 1000
        let api_event_seed = 0

        map.set(this, {
            api_id: api_id,
            connection: connection,
            events: eventEmitter,
            storage: storage,
            // These can be scoped into a range unique to this api
            // api_id + range + id
            // eh, could be something wiser in place
            event_ids: createEventIds(
                api_event_id,
                api_event_seed,
                [
                    // Objects
                    'get_objects',
                    // Blocks and transactions
                    'get_block_header',
                    'get_block_header_batch',
                    'get_block',
                    'get_transaction',
                    // Globals
                    'get_chain_properties',
                    'get_global_properties',
                    'get_config',
                    'get_chain_id',
                    'get_dynamic_global_properties',



                    'get_account_by_name',
                    'lookup_asset_symbols',
                    'get_assets',
                    'get_limit_orders',
                    'get_ticker',
                    'get_account_balances',
                ]
            )
        })

        //log.error(map.get(this).event_ids)

        // Handle incoming websocket messages in this class
        map.get(this).connection.on("message", data => this.message(data))
    }

    

    /*
    - Subscriptions
    set_subscribe_callback(callback(variant), notify_remove_create)
    set_pending_transaction_callback(callback(variant))
    set_block_applied_callback(callback(block_id))
    cancel_all_subscriptions()

    - Keys
    get_key_references(key) public key
    is_public_key_registered(key)

    - Accounts
    get_accounts(account_ids)
    get_full_accounts(name_or_ids, bool_subscribe)
    #get_account_by_name(name)
    get_account_references(account_id)
    lookup_account_names(names)
    lookup_accounts(name, limit)
    get_account_count()

    - Balances
    #get_account_balances(id, assets)
    get_named_account_balances(name, assets)
    get_balance_objects(addrs) lol? account name?
    get_vested_balances(objs) balance_ids
    get_vesting_balances(account_id)

    - Assets
    #get_assets(asset_ids)
    list_assets(symbol, limit)
    #lookup_asset_symbols(symbols_or_ids)

    - Markets / feeds
    #get_limit_orders(id_a, id_b, limit) asset id
    get_call_orders(id_a, limit) asset id
    get_settle_orders(id_a, limit) asset_id
    get_margin_positions(account_id)
    get_collateral_bids(asset_id, limit, start)
    subscribe_to_market(callback(variant), asset_a, asset_b) asset id
    unsubscribe_from_market(asset_a, asset_b) asset id
    #get_ticker(base, quote, skip_order_book = false)
    get_24_volume(base, quote)
    get_order_book(base, quote, limit=50)
    get_trade_history(base, quote, start, stop, limit=100)
    get_trade_history_by_sequence(base, quote, start, stop, limit=100)

    - Witnesses
    get_witnesses(witness_ids)
    get_witness_by_account(account_id)
    lookup_witness_accounts(name, limit)
    get_witness_count()

    - Committee members
    get_committee_members(committee_member_ids)
    get_committee_member_by_account(account_id)
    lookup_committee_member_accounts(name, limit)
    get_committee_count()

    - Workers
    get_all_workers()
    get_workers_by_account(account_id)
    get_worker_count()

    - Votes
    lookup_vote_ids(votes)

    - Authority / Validation
    get_transaction_hex(transaction)
    get_required_signatures(transaction, available_keys)
    get_potential_signatures(transaction)
    get_potential_address_signatures(transaction)
    verify_authority(transaction)
    verify_account_authority(name_or_id, signers)
    validate_transaction(transaction)
    get_required_fees(operations, asset_id)

    - Proposed transactions
    get_proposed_transactions(account_id)

    - Blinded balances
    get_blinded_balances(commitments) ???

this.connection.request(
    this.apiD,
    this.event_ids.,
    "",
    []
)
if(typeof callback !== 'undefined') {
    this.once("db.", callback)
}
    */

    //
    // Objects
    //

    /**
     * Get objects for ids
     * @param {array} ids array of object ids
     * @param {function} callback 
     */
    get_objects(ids, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.get_objects,
            "get_objects",
            [ids]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_objects", callback)
        }
    }

    //
    // Blocks and transactions
    //

    /**
     * Get a block header
     * @param {integer} block_num block id
     * @param {function} callback 
     */
    get_block_header(block_num, callback) {
        this.connection.request(
            this.apiD,
            this.event_ids.get_block_header,
            "get_block_header",
            [block_num]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_block_header", callback)
        }
    }

    /**
     * Get multiple block's headers
     * @param {array} block_nums array of block ids
     * @param {function} callback 
     */
    get_block_header_batch(block_nums, callback) {
        this.connection.request(
            this.apiD,
            this.event_ids.get_block_header_batch,
            "get_block_header_batch",
            [block_nums]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_block_header_batch", callback)
        }
    }

    /**
     * Get a block by its id
     * @param {integer} block_num block id
     * @param {function} callback 
     */
    get_block(block_num, callback) {
        this.connection.request(
            this.apiD,
            this.event_ids.get_block,
            "get_block",
            [block_num]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_block", callback)
        }
    }

    /**
     * Get a specific transaction from a block
     * @param {integer} block_num block id
     * @param {integer} transaction_id signed transaction id in given block id
     * @param {function} callback 
     */
    get_transaction(block_num, transaction_id, callback) {
        this.connection.request(
            this.apiD,
            this.event_ids.get_transaction,
            "get_transaction",
            [
                block_num,
                transaction_id
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_transaction", callback)
        }
    }

    //
    // Globals
    //

    /**
     * Get chain properties object
     * @param {function} callback 
     */
    get_chain_properties(callback) {
        this.connection.request(
            this.apiD,
            this.event_ids.get_chain_properties,
            "get_chain_properties",
            []
        )
        if(typeof callback !== 'undefined') {
            this.once("db.get_chain_properties", callback)
        }
    }

    /**
     * Get `current` global properties object
     * @param {function} callback 
     */
    get_global_properties(callback) {
        this.connection.request(
            this.apiD,
            this.event_ids.get_global_properties,
            "get_global_properties",
            []
        )
        if(typeof callback !== 'undefined') {
            this.once("db.get_global_properties", callback)
        }
    }

    /**
     * Get compiled constants
     * @param {function} callback 
     */
    get_config(callback) {
        this.connection.request(
            this.apiD,
            this.event_ids.get_config,
            "get_config",
            []
        )
        if(typeof callback !== 'undefined') {
            this.once("db.get_config", callback)
        }
    }

    /**
     * Get the chain ID
     * @param {function} callback 
     */
    get_chain_id(callback) {
        this.connection.request(
            this.apiD,
            this.event_ids.get_chain_id,
            "get_chain_id",
            []
        )
        if(typeof callback !== 'undefined') {
            this.once("db.get_chain_id", callback)
        }
    }

    /**
     * Get dynamic global properties?
     * What exactly is this?
     * @param {function} callback 
     */
    get_dynamic_global_properties(callback) {
        this.connection.request(
            this.apiD,
            this.event_ids.get_dynamic_global_properties,
            "get_dynamic_global_properties",
            []
        )
        if(typeof callback !== 'undefined') {
            this.once("db.get_dynamic_global_properties", callback)
        }
    }



    /**
     * Return an account object by username
     * @param {string} name account name
     * @param {function} callback 
     */
    get_account_by_name(name, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.get_account_by_name,
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
        this.connection.request(
            this.apiID,
            this.event_ids.get_assets,
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
        this.connection.request(
            this.apiID,
            this.event_ids.lookup_asset_symbols,
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

        this.connection.request(
            this.apiID,
            this.event_ids.get_limit_orders,
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
        this.connection.request(
            this.apiID,
            this.event_ids.get_ticker,
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
        this.connection.request(
            this.apiID,
            this.event_ids.get_account_balances,
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

            /* Objects */
            case events.get_objects:
                this.emit("db.get_objects", data.result)
            break;

            /* Blocks and transactions */
            case events.get_block_header:
                this.emit("db.get_block_header", data.result)
            break;

            case events.get_block_header_batch:
                this.emit("db.get_block_header_batch", data.result)
            break;

            case events.get_block:
                this.emit("db.get_block", data.result)
            break;

            case events.get_transaction:
                if(data.error) {
                    log.error(data.error.message)
                }
                this.emit("db.get_transaction", data.result)
            break;

            /* Globals */
            case events.get_chain_properties:
                this.emit("db.get_chain_properties", data.result)
            break;

            case events.get_global_properties:
                this.emit("db.get_global_properties", data.result)
            break;

            case events.get_config:
                this.emit("db.get_config", data.result)
            break;

            case events.get_chain_id:
                this.emit("db.get_chain_id", data.result)
            break;

            case events.get_dynamic_global_properties:
                this.emit("db.get_dynamic_global_properties", data.result)
            break;


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
     * @return {Connection} Connection instance
     */
    get connection() {
        return map.get(this).connection
    }

    /**
     * @return {object} event_ids
     */
    get event_ids() {
        return map.get(this).event_ids
    }

    /**
     * @return {integer} the API ID given for this instance
     */
    get apiID() {
        return map.get(this).api_id
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