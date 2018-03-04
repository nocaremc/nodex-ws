const Dict = require('collections/dict')
const Map = require('collections/map')
const log = require('./Log.js')
require('./Util.js')
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
                    // Keys
                    'get_key_references',
                    'is_public_key_registered',

                    // Accounts
                    'get_accounts',
                    'get_full_accounts',
                    'get_account_by_name',
                    'get_account_references',
                    'lookup_account_names',
                    'lookup_accounts',
                    'get_account_count',
                    // Balances
                    'get_account_balances',
                    'get_named_account_balances',
                    'get_balance_objects',
                    'get_vested_balances',
                    'get_vesting_balances',
                    // Assets
                    'get_assets',
                    'list_assets',
                    'lookup_asset_symbols',
                    // Markets / Feeds
                    'get_limit_orders',
                    'get_call_orders',
                    'get_settle_orders',
                    'get_margin_positions',
                    'get_collateral_bids',
                    'subscribe_to_market',
                    'unsubscribe_from_market',
                    'get_ticker',
                    'get_24_volume',
                    'get_order_book',
                    'get_trade_history',
                    'get_trade_history_by_sequence',


                    
                    
                    
                ]
            ),
            subscription_ids: new Map()
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

    //
    // Keys
    //

    /**
     * Get account IDs with public keys
     * @param {array} keys public keys as strings
     * @param {function} callback 
     */
    get_key_references(keys, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.get_key_references,
            "get_key_references",
            [keys]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_key_references", callback)
        }
    }

    /**
     * Is an account id(other?) associated with this public key?
     * @param {string} key public key
     * @param {function} callback 
     */
    is_public_key_registered(key, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.is_public_key_registered,
            "is_public_key_registered",
            [key]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.is_public_key_registered", callback)
        }
    }

    //
    // Accounts
    //

    /**
     * Get account objects by list of account ids
     * @param {array} account_ids 
     * @param {function} callback 
     */
    get_accounts(account_ids, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.get_accounts,
            "get_accounts",
            [account_ids]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_accounts", callback)
        }
    }

    /**
     * Get "full accounts" with a list of ids or names
     * @param {array} name_or_ids 
     * @param {boolean} subscribe 
     * @param {function} callback 
     */
    get_full_accounts(name_or_ids, subscribe, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.get_full_accounts,
            "get_full_accounts",
            [
                name_or_ids,
                subscribe
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_full_accounts", callback)
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
     * Get accounts that refer to this account in their owner/active permissions
     * @param {string} account_id 
     * @param {function} callback 
     */
    get_account_references(account_id, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.get_account_references,
            "get_account_references",
            [account_id]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_account_references", callback)
        }
    }

    /**
     * Look up a list of accounts by their names
     * @param {array} names account names
     * @param {function} callback 
     */
    lookup_account_names(names, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.lookup_account_names,
            "lookup_account_names",
            [names]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.lookup_account_names", callback)
        }
    }

    /**
     * Search for accounts like given account name/string
     * @param {string} name 
     * @param {integer} limit returned results MAX 1000, default 1
     * @param {function} callback 
     */
    lookup_accounts(name, limit, callback) {
        limit = limit.clamp(1, 1000)

        this.connection.request(
            this.apiID,
            this.event_ids.lookup_accounts,
            "lookup_accounts",
            [
                name,
                limit
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.lookup_accounts", callback)
        }
    }

    /**
     * Get a total count of accounts
     * @param {function} callback 
     */
    get_account_count(callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.get_account_count,
            "get_account_count",
            []
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_account_count", callback)
        }
    }

    //
    // Balances
    //

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
     * Get a specific account's balances for specified assets
     * @param {string} name account name
     * @param {array} asset_ids 
     * @param {function} callback 
     */
    get_named_account_balances(name, asset_ids, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.get_named_account_balances,
            "get_named_account_balances",
            [
                name,
                asset_ids
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_named_account_balances", callback)
        }
    }

/**
 * Get unclaimed balance objects for base58 addresses (legacy?)
 * @param {array} addrs array of base58 addresses?
 * @param {function} callback 
 */
get_balance_objects(addrs, callback) {
    log.error("DB.get_balance_objects is not implemented")
    // this.connection.request(
    //     this.apiID,
    //     this.event_ids.get_balance_objects,
    //     "get_balance_objects",
    //     [
    //         addrs
    //     ]
    // )

    // if(typeof callback !== 'undefined') {
    //     this.once("db.get_balance_objects", callback)
    // }
}

/**
 * Get vested balances for balance objects?
 * @param {array} objs 
 * @param {*} callback 
 */
get_vested_balances(objs, callback) {
    log.error("DB.get_vested_balances is not implemented")
    // this.connection.request(
    //     this.apiID,
    //     this.event_ids.get_vested_balances,
    //     "get_vested_balances",
    //     [objs]
    // )

    // if(typeof callback !== 'undefined') {
    //     this.once("db.get_vested_balances", callback)
    // }
}

    /**
     * Get the vesting balances for an account
     * @param {string} account_id 
     * @param {function} callback 
     */
    get_vesting_balances(account_id, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.get_vesting_balances,
            "get_vesting_balances",
            [account_id]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_vesting_balances", callback)
        }
    }

    //
    // Assets
    //

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
     * Search for an asset by its symbol
     * @param {string} symbol asset symbol
     * @param {integer} limit result limit. max 100
     * @param {function} callback 
     */
    list_assets(symbol, limit, callback) {
        limit = limit.clamp(1, 100)

        this.connection.request(
            this.apiID,
            this.event_ids.list_assets,
            "list_assets",
            [
                symbol,
                limit
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.list_assets", callback)
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

    //
    // Markets / feeds
    //

    /**
     * Get limit orders for asset pair
     * @param {string} asset_id_a 
     * @param {string} asset_id_b 
     * @param {int} limit - Maximum of 100, Default 1
     * @param {function} callback 
     */
    get_limit_orders(asset_id_a, asset_id_b, limit, callback) {
        limit = limit.clamp(1, 100)

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
     * Get call orders for an asset by id
     * @param {string} asset_id 
     * @param {integer} limit Max 100, min 1
     * @param {function} callback 
     */
    get_call_orders(asset_id, limit, callback) {
        limit = limit.clamp(1, 100)

        this.connection.request(
            this.apiID,
            this.event_ids.get_call_orders,
            "get_call_orders",
            [
                asset_id,
                limit
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_call_orders", callback)
        }
    }

    /**
     * Get settlement orders for an asset by id
     * @param {string} asset_id 
     * @param {integer} limit Max 100, min 1
     * @param {function} callback 
     */
    get_settle_orders(asset_id, limit, callback) {
        limit = limit.clamp(1, 100)

        this.connection.request(
            this.apiID,
            this.event_ids.get_settle_orders,
            "get_settle_orders",
            [
                asset_id,
                limit
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_settle_orders", callback)
        }
    }

    /**
     * Get margin positions for an account by id
     * @param {string} account_id 
     * @param {function} callback 
     */
    get_margin_positions(account_id, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.get_margin_positions,
            "get_margin_positions",
            [account_id]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_margin_positions", callback)
        }
    }

get_collateral_bids(asset_id, limit, start, callback) {
    log.error("db.get_collateral_bids is not yet implemented")
    /*
    limit = limit.clamp(1, 100)

    if(!start) {
        start = 0
    }

    this.connection.request(
        this.apiID,
        this.event_ids.get_collateral_bids,
        "get_collateral_bids",
        [
            asset_id,
            limit,
            start
        ]
    )

    if(typeof callback !== 'undefined') {
        this.once("db.get_collateral_bids", callback)
    }
    */
}

    /**
     * Initiate a subscription to the market for an asset pair
     * Repeatedly sends information on placed & filled orders, margins opened, etc
     * @param {string} asset_id_a 
     * @param {string} asset_id_b 
     * @param {function} callback 
     */
    subscribe_to_market(asset_id_a, asset_id_b, callback) {
        let key = this.event_ids.subscribe_to_market + this.subscription_ids.length + 500
        
        let value = asset_id_a + ":" + asset_id_b

        // Check if a subscription for this market exists
        // .... this doesn't stop the key from repeating
        if(!this.subscription_ids.has(key)) {
            this.subscription_ids.set(key, value)

            this.connection.request(
                this.apiID,
                this.event_ids.subscribe_to_market,
                "subscribe_to_market",
                [
                    key,
                    asset_id_a,
                    asset_id_b
                ]
            )
    
            if(typeof callback !== 'undefined') {
                this.on("db.subscribe_to_market." + value, callback)
            }
        } else {
            log.error("A subscription for: \"" + value + "\" already exists!")
        }
    }

    /**
     * Terminates the subscription for a pair
     * @param {string} asset_id_a 
     * @param {string} asset_id_b 
     */
    unsubscribe_from_market(asset_id_a, asset_id_b) {
        // Determine if this asset pair is subscribed to
        let pair = this.subscription_ids.filter(item => {
            return item === asset_id_a + ":" + asset_id_b
        })
        
        if(pair.length > 0) {
            if(pair.length > 1) {
                log.error('This is too long..')
                return
            }

            this.connection.request(
                this.apiID,
                this.event_ids.unsubscribe_from_market,
                "unsubscribe_from_market",
                [
                    asset_id_a,
                    asset_id_b
                ]
            )

            this.subscription_ids.delete(pair.get(0))
            log.info("Removed market subscription: " + asset_id_a + ":" + asset_id_b)
        }
    }
    
    /**
     * Get the ticker price for asset pair
     * @param {string} asset_id_base 
     * @param {string} asset_id_quote 
     * @param {boolean} skip skip order book? default false
     * @param {function} callback 
     */
    get_ticker(asset_id_base, asset_id_quote, skip, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.get_ticker,
            "get_ticker",
            [
                asset_id_base,
                asset_id_quote,
                skip
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_ticker", callback)
        }
    }

    /**
     * Get 24 hour volume of an asset pair by its symbol names
     * @param {string} base asset symbol
     * @param {string} quote asset symbol
     * @param {function} callback 
     */
    get_24_volume(base, quote, callback) {
        if(typeof base !== "string" || typeof quote !== "string") {
            log.error("db.get_24_volume: Base and Quote must be strings")
            return
        }

        this.connection.request(
            this.apiID,
            this.event_ids.get_24_volume,
            "get_24_volume",
            [
                base.toUpperCase(),
                quote.toUpperCase()
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_24_volume", callback)
        }
    }

    /**
     * Get order book for an asset pair by symbol names
     * @param {string} base asset symbol
     * @param {string} quote asset symbol
     * @param {integer} limit min 1, max 50
     * @param {function} callback 
     */
    get_order_book(base, quote, limit, callback) {
        if(typeof base !== "string" || typeof quote !== "string") {
            log.error("db.get_order_book: Base and Quote must be strings")
            return
        }
        
        limit = limit.clamp(1, 50)

        this.connection.request(
            this.apiID,
            this.event_ids.get_order_book,
            "get_order_book",
            [
                base.toUpperCase(),
                quote.toUpperCase(),
                limit
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_order_book", callback)
        }
    }

    /**
     * Get trade history for an asset pair by symbol
     * @param {string} base asset symbol
     * @param {string} quote asset symbol
     * @param {string} start end date as a unix UTC ISO formatted timestamp
     * @param {string} stop start date as a unix UTC ISO formatted timestamp
     * @param {integer} limit min 1, max 100
     * @param {function} callback 
     */
    get_trade_history(base, quote, start, stop, limit, callback) {
        if(typeof base !== "string" || typeof quote !== "string") {
            log.error("db.get_order_book: Base and Quote must be strings")
            return
        }

        limit = limit.clamp(1, 100)

        this.connection.request(
            this.apiID,
            this.event_ids.get_trade_history,
            "get_trade_history",
            [
                base.toUpperCase(),
                quote.toUpperCase(),
                start,
                stop,
                limit
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_trade_history", callback)
        }
    }

    // get_trade_history_by_sequence(base, quote, start, stop, limit) {
    //     limit = limit.clamp(1, 100)
    // }


    

    

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

    get subscription_ids() {
        return map.get(this).subscription_ids
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

    /**
     * Handles incoming websocket responses related to database api
     * @param {string} data response data as JSON string
     */
    message(data) {
        data = JSON.parse(data)
        let events = map.get(this).event_ids

        // LATER: Would be nice for every error to be handled
        // instead of simply dumping assertion junk
        if(typeof data.error !== 'undefined') {
            log.error(data.error)
        }

        switch(data.id) {

            //
            // Objects
            //
            case events.get_objects:
                this.emit("db.get_objects", data.result)
            break;

            //
            // Blocks and transactions
            //
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

            //
            // Globals
            // 
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
            
            //
            // Keys
            //
            case events.get_key_references:
                this.emit("db.get_key_references", data.result)
            break;

            case events.is_public_key_registered:
                this.emit("db.is_public_key_registered", data.result)
            break;

            //
            // Accounts
            //
            case events.get_accounts:
                this.emit("db.get_accounts", data.result)
            break;

            case events.get_full_accounts:
                this.emit("db.get_full_accounts", data.result)
            break;

            case events.get_account_by_name:
                this.emit("db.get_account_by_name", data.result)
            break;

            case events.get_account_references:
                this.emit("db.get_account_references", data.result)
            break;

            case events.lookup_account_names:
                this.emit("db.lookup_account_names", data.result)
            break;

            case events.lookup_accounts:
                this.emit("db.lookup_accounts", data.result)
            break;

            case events.get_account_count:
                this.emit("db.get_account_count", data.result)
            break;
            
            //
            // Balances
            //
            case events.get_account_balances:
                //let x = new Balances(data.result)
                this.emit("db.get_account_balances", data.result)
            break;
            
            case events.get_named_account_balances:
                this.emit("db.get_named_account_balances", data.result)
            break;

            case events.get_balance_objects:
                this.emit("db.get_balance_objects", data.result)
            break;

            case events.get_vested_balances:
                this.emit("db.get_vested_balances", data.result)
            break;

            case events.get_vesting_balances:
                this.emit("db.get_vesting_balances", data.result)
            break;

            //
            // Assets
            //
            
            case events.get_assets:
                // After assets have been stored, we'll pass the stored assets
                // back to get_assets
                this.once('store.assets.stored', (assets) => {
                    this.emit('db.get_assets', assets)
                })

                // Store retrieved assets
                this.emit('store.assets', data.result)
            break;

            case events.list_assets:
                this.emit("db.list_assets", data.result)
            break;
            
            case events.lookup_asset_symbols:
                this.emit("db.lookup_asset_symbols", data.result)
            break;

            //
            // Markets / Feeds
            //

            case events.get_limit_orders:
                this.emit("db.get_limit_orders", data.result)
            break;

            case events.get_call_orders:
                if(data.error) {
                    switch(data.error.code) {
                        case 1:
                            log.error("You cannot list call orders for this asset")
                        break;
                    }
                }
                this.emit("db.get_call_orders", data.result)
            break;

            case events.get_settle_orders:
                this.emit("db.get_settle_orders", data.result)
            break;

            case events.get_margin_positions:
                this.emit("db.get_margin_positions", data.result)
            break;

            case events.get_collateral_bids:
                if(data.error) {
                    switch(data.error.code) {
                        case 1:
                            log.error("You cannot list collateral bids for this asset")
                        break;
                    }
                }
                this.emit("db.get_collateral_bids", data.result)
            break;

            case events.subscribe_to_market:
                this.emit("db.subscribe_to_market", data.result)
            break;

            case events.unsubscribe_from_market:
                this.emit("db.unsubscribe_from_market", data.result)
            break;

            case events.get_ticker:
                this.emit("db.get_ticker", data.result)
            break;

            case events.get_24_volume:
                this.emit("db.get_24_volume", data.result)
            break;

            case events.get_order_book:
                this.emit("db.get_order_book", data.result)
            break;

            case events.get_trade_history:
                this.emit("db.get_trade_history", data.result)
            break;

            case events.get_trade_history_by_sequence:
                this.emit("db.get_trade_history_by_sequence", data.result)
            break;

            default:
                //log.info("Unkown event coming")
                
                // This may be a subscription
                if(data.method === 'notice') {
                    
                    let id = data.params[0]

                    // Emit event if subscription key found
                    if(this.subscription_ids.has(id)) {
                        this.emit(
                            "db.subscribe_to_market." + this.subscription_ids.get(id),
                            data.params[1]
                        )
                        return
                    }
                }
                log.info(data)
            break;
        }
    }
}

module.exports = Database