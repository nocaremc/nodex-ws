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
                    // Subscriptions
                    'set_subscribe_callback',
                    'set_pending_transaction_callback',
                    'set_block_applied_callback',
                    'cancel_all_subscriptions',
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
                    // Witnesses
                    'get_witnesses',
                    'get_witness_by_account',
                    'lookup_witness_accounts',
                    'get_witness_count',
                    // Committee members
                    'get_committee_members',
                    'get_committee_member_by_account',
                    'lookup_committee_member_accounts',
                    'get_committee_count',
                    // Workers
                    'get_all_workers',
                    'get_workers_by_account',
                    'get_worker_count',
                    // Votes
                    'lookup_vote_ids',
                    // Authority / Validation
                    'get_transaction_hex',
                    'get_required_signatures',
                    'get_potential_signatures',
                    'get_potential_address_signatures',
                    'verify_authority',
                    'verify_account_authority',
                    'validate_transaction',
                    'get_required_fees',
                    // Proposed Transactions
                    'get_proposed_transactions',
                    // Blinded Balances
                    'get_blinded_balances',
                ]
            ),
            subscription_ids: new Map()
        })

        //log.error(map.get(this).event_ids)

        // Handle incoming websocket messages in this class
        map.get(this).connection.on("message", data => this.message(data))
    }

    //
    // Objects
    //

    /**
     * Get objects for ids
     * @param {array} ids array of object ids
     */
    async get_objects(ids) {
        return this.callWrapper("get_objects", [ids])
    }

    //
    // Subscriptions
    //
    // LATER: What does this set of functions even do?

    /**
     * Subscribe to ???
     * @param {function} callback (unused as unsure of purpose)
     * @param {boolean} notify_remove_create 
     */
    async set_subscribe_callback(notify_remove_create) {
        let key = this.event_ids.set_subscribe_callback + this.subscription_ids.length + 400
        let value = 'db.set_subscribe_callback.general'

        // Check if a subscription for this market exists
        // .... this doesn't stop the key from repeating
        let hasKey = await this.subscription_ids.has(key)
        if(!hasKey) {
            await this.subscription_ids.set(key, value)

            return this.subscribeWrapper(
                "set_subscribe_callback", 
                [
                    key, // Callback goes here, but seems to prefer integers.
                    notify_remove_create
                ],
                value
            )

        } else {
            log.error("A subscription for: \"" + value + "\" already exists!")
        }
    }


    /*set_pending_transaction_callback(callback(variant)) {

    }
    set_block_applied_callback(callback(block_id)) {

    }*/
    async cancel_all_subscriptions() {
        let pair = this.subscription_ids.filter(item => {
            return item === 'db.set_subscribe_callback.general'
        })
        
        if(pair.length > 0) {
            if(pair.length > 1) {
                log.error('This is too long..')
                return false
            }
            
            this.subscription_ids.delete(pair.get(0))
            log.info("Removed general subscriptions")
            return await this.callWrapper("cancel_all_subscriptions", [])
        }
        return false
    }

    //
    // Blocks and transactions
    //

    /**
     * Get a block header
     * @param {integer} block_num block id
     */
    async get_block_header(block_num) {
        return this.callWrapper("get_block_header", [block_num])
    }

    /**
     * Get multiple block's headers
     * @param {array} block_nums array of block ids
     */
    async get_block_header_batch(block_nums) {
        return this.callWrapper("get_block_header_batch", [block_nums])
    }

    /**
     * Get a block by its id
     * @param {integer} block_num block id
     */
    async get_block(block_num) {
        return this.callWrapper("get_block", [block_num])
    }

    /**
     * Get a specific transaction from a block
     * @param {integer} block_num block id
     * @param {integer} transaction_id signed transaction id in given block id
     */
    async get_transaction(block_num, transaction_id) {
        return this.callWrapper("get_transaction", [
            block_num,
            transaction_id
        ])
    }

    //
    // Globals
    //

    /**
     * Get chain properties object
     */
    async get_chain_properties() {
        return this.callWrapper("get_chain_properties", [])
    }

    /**
     * Get `current` global properties object
     */
    async get_global_properties() {
        return this.callWrapper("get_global_properties", [])
    }

    /**
     * Get compiled constants
     */
    async get_config() {
        return this.callWrapper("get_config", [])
    }

    /**
     * Get the chain ID
     */
    async get_chain_id() {
        return this.callWrapper("get_chain_id", [])
    }

    /**
     * Get dynamic global properties?
     * What exactly is this?
     */
    async get_dynamic_global_properties() {
        return this.callWrapper("get_dynamic_global_properties", [])
    }

    //
    // Keys
    //

    /**
     * Get account IDs with public keys
     * @param {array} keys public keys as strings
     */
    async get_key_references(keys) {
        return this.callWrapper("get_key_references", [keys])
    }

    /**
     * Is an account id(other?) associated with this public key?
     * @param {string} key public key
     */
    async is_public_key_registered(key) {
        return this.callWrapper("is_public_key_registered", [key])
    }

    //
    // Accounts
    //

    /**
     * Get account objects by list of account ids
     * @param {array} account_ids 
     */
    async get_accounts(account_ids) {
        return this.callWrapper("get_accounts", [account_ids])
    }

    /**
     * Get "full accounts" with a list of ids or names
     * @param {array} name_or_ids 
     * @param {boolean} subscribe 
     */
    async get_full_accounts(name_or_ids, subscribe) {
        return this.callWrapper("get_full_accounts", [
            name_or_ids,
            subscribe
        ])
    }

    /**
     * Return an account object by username
     * @param {string} name account name
     */
    async get_account_by_name(name) {
        return this.callWrapper("get_account_by_name", [name])
    }

    /**
     * Get accounts that refer to this account in their owner/active permissions
     * @param {string} account_id 
     */
    async get_account_references(account_id) {
        return this.callWrapper("get_account_references", [account_id])
    }

    /**
     * Look up a list of accounts by their names
     * @param {array} names account names
     */
    async lookup_account_names(names) {
        return this.callWrapper("lookup_account_names", [names])
    }

    /**
     * Search for accounts like given account name/string
     * @param {string} name 
     * @param {integer} limit returned results MAX 1000, default 1
     */
    async lookup_accounts(name, limit) {
        limit = clamp(limit, 1, 1000)

        return this.callWrapper("lookup_accounts", [name, limit])
    }

    /**
     * Get a total count of accounts
     */
    async get_account_count() {
        return this.callWrapper("get_account_count", [])
    }

    //
    // Balances
    //

    /**
     * Check account balances
     * @param {string} account_id 
     * @param {array} assets - asset ids
     */
    async get_account_balances(account_id, assets) {
        // LATER: error check asset ids... as a start
        return this.callWrapper("get_account_balances", [account_id, assets])
    }
    
    /**
     * Get a specific account's balances for specified assets
     * @param {string} name account name
     * @param {array} asset_ids 
     */
    async get_named_account_balances(name, asset_ids) {
        return this.callWrapper("get_named_account_balances", [
            name,
            asset_ids
        ])
    }

/**
 * Get unclaimed balance objects for base58 addresses (legacy?)
 * @param {array} addrs array of base58 addresses?
 */
async get_balance_objects(addrs) {
    log.error("DB.get_balance_objects is not tested")
    return false //this.callWrapper("get_balance_objects", [addrs])
}

/**
 * Get vested balances for balance objects?
 * @param {array} objs 
 */
async get_vested_balances(objs) {
    log.error("DB.get_vested_balances is not tested")
    return false //this.callWrapper("get_vested_balances", [objs])
}

    /**
     * Get the vesting balances for an account
     * @param {string} account_id 
     */
    async get_vesting_balances(account_id) {
        return this.callWrapper("get_vesting_balances", [account_id])
    }

    //
    // Assets
    //

    /**
     * Return a list of assets by asset_ids
     * @param {array} asset_ids 
     */
    async get_assets(asset_ids) {
        return this.callWrapper("get_assets", [asset_ids])
    }

    /**
     * Search for an asset by its symbol
     * @param {string} symbol asset symbol
     * @param {integer} limit result limit. max 100
     */
    async list_assets(symbol, limit) {
        limit = clamp(limit, 1, 100)

        return this.callWrapper("list_assets", [symbol, limit])
    }
    
    /**
     * Get a list of assets using a list of symbols
     * @param {array} symbols array asset symbol names
     */
    async lookup_asset_symbols(symbols) {
        // We could/should check local asset collection first.
        // Then we could build and emit a replica locally
        return this.callWrapper("lookup_asset_symbols", [JSON.parse(symbols)])
    }

    //
    // Markets / feeds
    //

    /**
     * Get limit orders for asset pair
     * @param {string} asset_id_a 
     * @param {string} asset_id_b 
     * @param {int} limit - Maximum of 100, Default 1
     */
    async get_limit_orders(asset_id_a, asset_id_b, limit) {
        limit = clamp(limit, 1, 100)
        
        return this.callWrapper("get_limit_orders", [
            asset_id_a,
            asset_id_b,
            limit
        ])
    }

    /**
     * Get call orders for an asset by id
     * @param {string} asset_id 
     * @param {integer} limit Max 100, min 1
     */
    async get_call_orders(asset_id, limit) {
        limit = clamp(limit, 1, 100)

        return this.callWrapper("get_call_orders", [asset_id, limit])
    }

    /**
     * Get settlement orders for an asset by id
     * @param {string} asset_id 
     * @param {integer} limit Max 100, min 1
     */
    async get_settle_orders(asset_id, limit) {
        limit = clamp(limit, 1, 100)

        return this.callWrapper("get_settle_orders", [asset_id, limit])
    }

    /**
     * Get margin positions for an account by id
     * @param {string} account_id 
     */
    async get_margin_positions(account_id) {
        return this.callWrapper("get_margin_positions", [account_id])
    }

async get_collateral_bids(asset_id, limit, start) {
    log.error("db.get_collateral_bids is not tested")

    limit = clamp(limit, 1, 100)

    if(!start) {
        start = 0
    }
    return false /*this.callWrapper("get_margin_positions", [
        asset_id,
        limit,
        start
    ])*/
}

    /**
     * Initiate a subscription to the market for an asset pair
     * Repeatedly sends information on placed & filled orders, margins opened, etc
     * @param {string} asset_id_a 
     * @param {string} asset_id_b 
     * CAREFULLY CHECK THIS AFTER ASYNC CHANGES
     */
    async subscribe_to_market(asset_id_a, asset_id_b) {
        let key = this.event_ids.subscribe_to_market + this.subscription_ids.length + 500
        
        let value = "db.subscribe_to_market." + asset_id_a + ":" + asset_id_b

        // Check if a subscription for this market exists
        // .... this doesn't stop the key from repeating
        let hasKey = await this.subscription_ids.has(key)
        if(!hasKey) {
            await this.subscription_ids.set(key, value)

            return this.subscribeWrapper("subscribe_to_market", [
                key,
                asset_id_a,
                asset_id_b
            ], value)
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
            return item === "db.subscribe_to_market." + asset_id_a + ":" + asset_id_b
        })
        
        if(pair.length > 0) {
            if(pair.length > 1) {
                log.error('This is too long..')
                return false
            }
            
            this.subscription_ids.delete(pair.get(0))
            this.callWrapper("unsubscribe_from_market", [asset_id_a, asset_id_b])

            
            log.info("Removed market subscription: " + asset_id_a + ":" + asset_id_b)
            return true
        }
    }
    
    /**
     * Get the ticker price for asset pair
     * @param {string} asset_id_base 
     * @param {string} asset_id_quote 
     * @param {boolean} skip skip order book? default false
     */
    async get_ticker(asset_id_base, asset_id_quote, skip) {
        return this.callWrapper("get_ticker", [
            asset_id_base,
            asset_id_quote,
            skip
        ])
    }

    /**
     * Get 24 hour volume of an asset pair by its symbol names
     * @param {string} base asset symbol
     * @param {string} quote asset symbol
     */
    async get_24_volume(base, quote) {
        if(typeof base !== "string" || typeof quote !== "string") {
            log.error("db.get_24_volume: Base and Quote must be strings")
            return false
        }

        return this.callWrapper("get_24_volume", [
            base.toUpperCase(),
            quote.toUpperCase()
        ])
    }

    /**
     * Get order book for an asset pair by symbol names
     * @param {string} base asset symbol
     * @param {string} quote asset symbol
     * @param {integer} limit min 1, max 50
     */
    async get_order_book(base, quote, limit) {
        if(typeof base !== "string" || typeof quote !== "string") {
            log.error("db.get_order_book: Base and Quote must be strings")
            return false
        }
        
        limit = clamp(limit, 1, 50)

        return this.callWrapper("get_order_book", [
            base.toUpperCase(),
            quote.toUpperCase(),
            limit
        ])
    }

    /**
     * Get trade history for an asset pair by symbol
     * @param {string} base asset symbol
     * @param {string} quote asset symbol
     * @param {string} start end date as a unix UTC ISO formatted timestamp
     * @param {string} stop start date as a unix UTC ISO formatted timestamp
     * @param {integer} limit min 1, max 100
     */
    async get_trade_history(base, quote, start, stop, limit) {
        if(typeof base !== "string" || typeof quote !== "string") {
            log.error("db.get_order_book: Base and Quote must be strings")
            return false
        }

        limit = clamp(limit, 1, 100)

        return this.callWrapper("get_trade_history", [
            base.toUpperCase(),
            quote.toUpperCase(),
            start,
            stop,
            limit
        ])
    }

    /**
     * Get trade history by history sequence for an asset pair by symbol
     * @param {string} base asset symbol
     * @param {string} quote asset symbol
     * @param {integer} start sequence value for a history_key
     * @param {string} stop start date as a unix UTC ISO formatted timestamp
     * @param {integer} limit min 1, max 100
     */
    async get_trade_history_by_sequence(base, quote, start, stop, limit) {
        if(typeof base !== "string" || typeof quote !== "string") {
            log.error("db.get_trade_history_by_sequence: Base and Quote must be strings")
            return false
        }

        limit = clamp(limit, 1, 100)

        return this.callWrapper("get_trade_history_by_sequence", [
            base.toUpperCase(),
            quote.toUpperCase(),
            start,
            stop,
            limit
        ])
    }

    //
    // Witnesses
    //

    /**
     * Get a list of witnesses by witness ids
     * @param {array} witness_ids 
     */
    async get_witnesses(witness_ids) {
        return this.callWrapper("get_witnesses", [witness_ids])
    }

    /**
     * Get a witness id by user's account id
     * @param {string} account_id 
     */
    async get_witness_by_account(account_id) {
        return this.callWrapper("get_witness_by_account", [account_id])
    }

    /**
     * Search for witnesses by account name
     * @param {string} name 
     * @param {integer} limit min 1, max 1000
     */
    async lookup_witness_accounts(name, limit) {
        limit = clamp(limit, 1, 1000)
        
        return this.callWrapper("lookup_witness_accounts", [
            name,
            limit
        ])
    }

    /**
     * Get a total count of witnesses
     */
    async get_witness_count() {
        return this.callWrapper("get_witness_count", [])
    }

    //
    // Committee members
    //

    /**
     * Get committee members by their member ids
     * @param {array} member_ids committee member ids
     */
    async get_committee_members(member_ids) {
        return this.callWrapper("get_committee_members", [member_ids])
    }

    /**
     * Get committee member id by owner account id
     * @param {string} account_id 
     */
    async get_committee_member_by_account(account_id) {
        return this.callWrapper("get_committee_member_by_account", [account_id])
    }

    /**
     * Search committee members by account name, returning committee member ids
     * @param {string} name 
     * @param {integer} limit min 1, max 1000
     */
    async lookup_committee_member_accounts(name, limit) {
        limit = clamp(limit, 1, 1000)
        
        return this.callWrapper("lookup_committee_member_accounts", [
            name,
            limit
        ])
    }
    
    /**
     * Get a total count of committee members
     */
    async get_committee_count() {
        return this.callWrapper("get_committee_count", [])
    }

    //
    // Workers
    //

    /**
     * Get a list of all workers
     */
    async get_all_workers() {
        return this.callWrapper("get_all_workers", [])
    }

    /**
     * Get all workers associated with account_id
     * @param {string} account_id 
     */
    async get_workers_by_account(account_id) {
        return this.callWrapper("get_workers_by_account", [account_id])
    }

    /**
     * Get a total count of workers
     */
    async get_worker_count() {
        return this.callWrapper("get_worker_count", [])
    }

    //
    // Votes
    //

    /**
     * Find the objects the given vote_ids are for
     * @param {array} vote_ids 
     */
    async lookup_vote_ids(vote_ids) {
        return this.callWrapper("lookup_vote_ids", [vote_ids])
    }

    //
    // Authority / Validation
    //

    /**
     * Get a hexdump for transaction
     * @param {object} transaction transaction object
     */
    async get_transaction_hex(transaction) {
        return this.callWrapper("get_transaction_hex", [transaction])
    }

/**
 * LATER: This does a thing
 * @param {object} transaction "partially signed" transaction
 * @param {array} available_keys public keys
 */
async get_required_signatures(transaction, available_keys) {
    return this.callWrapper("get_required_signatures", [transaction, available_keys])
}

    /**
     * Get potential public keys for transaction
     * @param {object} transaction transaction object
     */
    async get_potential_signatures(transaction) {
        return this.callWrapper("get_potential_signatures", [transaction])
    }

/**
 * LATER: This does a thing
 * @param {object} transaction transaction object
 */
async get_potential_address_signatures(transaction) {
    return this.callWrapper("get_potential_address_signatures", [transaction])
}

    /**
     * Does this transaction have the required signatures?
     * @param {object} transaction transaction object
     */
    async verify_authority(transaction) {
        return this.callWrapper("verify_authority", [transaction])
    }

/**
 * Verify public keys have authority to authorize account
 * @param {string} account_name_or_id 
 * @param {array} keys public keys
 */
async verify_account_authority(account_name_or_id, keys) {
    log.error('db.verifiy_account_authority "true" state is not tested')
    return this.callWrapper("verify_account_authority", [account_name_or_id , keys])
}

/**
 * Validates a transaction (against "current state") without broacasting it
 * @param {object} transaction 
 */
async validate_transaction(transaction) {
    log.error('db.validate_transaction is untested')
    return this.callWrapper("validate_transaction", [transaction])
}

/**
 * Get fees for each operate on asset.
 * LATER: What is an operation?
 * @param {array} operations 
 * @param {string} asset_id 
 */
async get_required_fees(operations, asset_id) {
    log.error('db.get_required_fees is not tested')
    return this.callWrapper("get_required_fees", [operations, asset_id])
}

    //
    // Proposed Transactions
    //

    /**
     * Get proposed transactions for an account
     * @param {string} account_id 
     */
    get_proposed_transactions(account_id) {
        return this.callWrapper("get_proposed_transactions", [account_id])
    }

    //
    // Blinded Balances
    //

    /**
     * Return blinded balance objects by commitment id
     * @param {array} commitments commitment ids
     */
    get_blinded_balances(commitments) {
        log.error('db.get_blinded_balances is not tested')
        return this.callWrapper("get_blinded_balances", [commitments])
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

    get subscription_ids() {
        return map.get(this).subscription_ids
    }

    /**
     * @return {integer} the API ID given for this instance
     */
    get apiID() {
        return map.get(this).api_id
    }

    async callWrapper(method, params) {
        // LATER: verify method in ids
        return new Promise(resolve => {
            this.once("db." + method, resolve)
            this.connection.request(this.apiID, this.event_ids[method], method, params)
        })
    }

    subscribeWrapper(method, params, key) {
        // LATER: verify method in ids
        this.connection.request(this.apiID, this.event_ids[method], method, params)
        return key
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
            // Subscriptions
            //
            case events.set_subscribe_callback:
                
                this.emit('db.set_subscribe_callback', data.result)
            break;
            //set_pending_transaction_callback
            //set_block_applied_callback
            
            case events.cancel_all_subscriptions:
                this.emit('db.cancel_all_subscriptions', data.result)
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

            //
            // Witnesses
            //
            
            case events.get_witnesses:
                this.emit("db.get_witnesses", data.result)
            break;

            case events.get_witness_by_account:
                this.emit("db.get_witness_by_account", data.result)
            break;

            case events.lookup_witness_accounts:
                this.emit("db.lookup_witness_accounts", data.result)
            break;

            case events.get_witness_count:
                this.emit("db.get_witness_count", data.result)
            break;

            //
            // Committee Members
            //

            case events.get_committee_members:
                this.emit("db.get_committee_members", data.result)
            break;

            case events.get_committee_member_by_account:
                this.emit("db.get_committee_member_by_account", data.result)
            break;

            case events.lookup_committee_member_accounts:
                this.emit("db.lookup_committee_member_accounts", data.result)
            break;

            case events.get_committee_count:
                this.emit("db.get_committee_count", data.result)
            break;

            //
            // Workers
            //
            case events.get_all_workers:
                this.emit("db.get_all_workers", data.result)
            break;

            case events.get_workers_by_account:
                this.emit("db.get_workers_by_account", data.result)
            break;

            case events.get_worker_count:
                this.emit("db.get_worker_count", data.result)
            break;

            //
            // Votes
            //

            case events.lookup_vote_ids:
                this.emit('db.lookup_vote_ids', data.result)
            break;
            
            //
            // Authority / Validation
            //
            case events.get_transaction_hex:
                this.emit('db.get_transaction_hex', data.result)
            break;

            case events.get_required_signatures:
                this.emit('db.get_required_signatures', data.result)
            break;

            case events.get_potential_signatures:
                this.emit('db.get_potential_signatures', data.result)
            break;

            case events.get_potential_address_signatures:
                this.emit('db.get_potential_address_signatures', data.result)
            break;

            case events.verify_authority:
                this.emit('db.verify_authority', data.result)
            break;

            case events.verify_account_authority:
                this.emit('db.verify_account_authority', data.result)
            break;

            case events.validate_transaction:
                this.emit('db.validate_transaction', data.result)
            break;

            case events.get_required_fees:
                this.emit('db.get_required_fees', data.result)
            break;
            
            //
            // Proposed Transactions
            //
            case events.get_proposed_transactions:
                this.emit('db.get_proposed_transactions', data.result)
            break;

            //
            // Blinded Balances
            //
            case events.get_blinded_balances:
                this.emit('db.get_blinded_balances', data.result)
            break;

            default:
                //log.info("Unkown event coming")
                
                // This may be a subscription
                if(data.method === 'notice') {
                    let id = data.params[0]

                    // Emit event if subscription key found
                    if(this.subscription_ids.has(id)) {
                        this.emit(
                            this.subscription_ids.get(id),
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