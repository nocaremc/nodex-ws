/*
 I'm doing little more than scratching out examples as I go along in this file
*/
const dotenv = require('dotenv')
const log = require('./src/Log.js')
const API = require('./src/API.js')
// Load environment variables
dotenv.load()

// Instantiate api, connecting to rpc node
let api = new API(process.env.RPC_NODE, {perMessageDeflate: false})

api.on("open", () => {
    log.success("Websocket ready")
    api.login(process.env.DEX_USER, process.env.DEX_PASS, result => {
        //log.info("login was " + result)
    })
    api.database(async database => {
    
    // Here we'll wait for the db api to be initialized
    
        log.success("Database initialized")
        
        // Obtain user_id for a given username
        //log.warn(await api.database_api.get_account_by_name(process.env.DEX_USER))
        
        // Let's grab a list of assets we care about
        //log.warn(await api.database_api.lookup_asset_symbols(process.env.ASSET_SYMBOLS))

        // Grab limit orders for bts:cny (unsure on base/quote)
        //log.warn(await api.database_api.get_limit_orders('1.3.0', '1.3.113', 20))

        // Grab ticker price for bts:cny
        //log.warn(await api.database_api.get_ticker('1.3.0', '1.3.113', false))

        //log.warn(await api.database_api.get_assets(['1.3.113', '1.3.0']))
        
        // Get some random objects
        //log.warn(await api.database_api.get_objects(["2.4.21","2.4.83"]))
        
        // Get block header
        //log.warn(await api.database_api.get_block_header(24614236))

        // Get block's headers
        //log.warn(await api.database_api.get_block_header_batch([24614236, 24614695]))

        // Get block
        //log.warn(await api.database_api.get_block(24614236))

        // Get a transaction from a block
        //log.warn(await database.get_transaction(24614807, 1))
        
        // Get Chain Properties
        //log.warn(await api.database_api.get_chain_properties())

        // Get current global properties
        //log.warn(await api.database_api.get_global_properties())

        // Get compiled constants
        //log.warn(await api.database_api.get_config())

        // Get the chain id
        //log.warn(await api.database_api.get_chain_id())

        // get "dynamic global properties"
        //log.warn(await api.database_api.get_dynamic_global_properties())

        // Get account ids associated with these public keys
        // log.warn(
        //     await api.database_api.get_key_references(
        //         [
        //             '<public_key>',
        //             '<public_key>'
        //         ]
        //     )
        // )

        // Check if public key is registered (to an account?)
        //log.warn(await api.database_api.is_public_key_registered('<public_key>'))

        // Get a list of accounts by ids
        //log.warn(await api.database_api.get_accounts([process.env.DEX_USER_ID]))

        //Get "full accounts" with a list of ids or names
        // log.warn(
        //     await api.database_api.get_full_accounts(
        //         [
        //             process.env.DEX_USER_ID,
        //             process.env.DEX_USER
        //         ],
        //         false
        //     )
        // )
        
        // Get accounts that refer to this account in their permissions
        //log.warn(await api.database_api.get_account_references(process.env.DEX_USER_ID))

        // Look up a list of accounts using account names
        // log.warn(
        //     await api.database_api.lookup_account_names(
        //         [
        //             process.env.DEX_USER,
        //             'bitshares'
        //         ],
        //     )
        // )

        // Search for an account by name, list 10 results
        //log.warn(await api.database_api.lookup_accounts(process.env.DEX_USER, 10))

        // Get a total count of accounts
        //log.warn(await api.database_api.get_account_count())
        
        // Get account balance for cny and usd
        // log.warn(
        //     await api.database_api.get_account_balances(
        //         process.env.DEX_USER_ID,
        //         ['1.3.0', '1.3.113']
        //     )
        // )

        // Get a specific account's balance for specified assets
        // log.warn(
        //     await api.database_api.get_named_account_balances(
        //         process.env.DEX_USER,
        //         ['1.3.0']
        //     )
        // )

// Unsure how to get this one going
        // log.warn(
        //     await api.database_api.get_balance_objects(['base58somethingsomething'])
        // )
// Unsure how to get this one going
        // log.warn(
        //     await api.database_api.get_vested_balances([process.env.DEX_USER_ID])
        // )
        
        //log.warn(await api.database_api.get_vesting_balances(process.env.DEX_USER_ID))

        // Search for an asset by symbol name
        //log.warn(await api.database_api.list_assets('CNY', 1))

        // Get call orders for asset
        //log.warn(await api.database_api.get_call_orders('1.3.113', 20))

        // get settle orders for asset
        //log.warn(await api.database_api.get_settle_orders('1.3.113', 20))

        // Get margins for an account
        //log.warn(await api.database_api.get_margin_positions(process.env.DEX_USER_ID))

// Unsure how to use this, or if even implemented
        //log.warn(await api.database_api.get_collateral_bids('1.3.0', 1000, 0))

        // Subscribe to a bts:cny market
        // let market_subscription_id = await database.subscribe_to_market('1.3.0', '1.3.113')
        // database.on(market_subscription_id, async data => {
        //     log.warn(data);
            
        //     // Now unsubscribe from bts:cny market
        //     await database.unsubscribe_from_market('1.3.0', '1.3.113')
        // })

        // Get 24 hour volume of an asset pair by symbol names
        //log.warn(await api.database_api.get_24_volume('BTS', 'CNY'))

        // Get current order book for pair
        //log.warn(await api.database_api.get_order_book('CNY', 'BTS', 50))
        
        // Get trade history for an asset pair
        // When testing this, dates need to be within RPC_NODE's history (not too old)
        // log.warn(
        //     await api.database_api.get_trade_history(
        //         'CNY',
        //         'BTS',
        //         '2018-03-09T07:57:52', // start
        //         '2018-03-08T07:57:52', // stop
        //         10
        //     )
        // )

        // Get trade history, using a history sequence (from a history key) value
        // log.warn(
        //     await api.database_api.get_trade_history_by_sequence(
        //         'CNY',
        //         'BTS',
        //         10, // start
        //         '2018-03-09T07:57:52', // stop
        //         10, // limit
        //     )
        // )

        // Get a witness id by their account_id (in.abit)
        //log.warn(await api.database_api.get_witness_by_account('1.2.35248'))
        
        // Get a witness object by its witness id (in.abit)
        //log.warn(await api.database_api.get_witnesses(['1.6.35']))

        // Search for a witness id by their witness account name
        //log.warn(await api.database_api.lookup_witness_accounts('in.abit', 5))

        // Get a count of witnesses
        //log.warn(await api.database_api.get_witness_count())

        // Get committee member objects by ids
        //log.warn(await api.database_api.get_committee_members(['1.5.13']))

        // Get committee member by committee member account id
        //log.warn(await api.database_api.get_committee_member_by_account('1.2.21106'))

        // Search committee members by account name
        //log.warn(await api.database_api.lookup_committee_member_accounts('fav', 50))

        // Get a total count of committee memebers
        //log.warn(await api.database_api.get_committee_count())

        // Get list of all workers
        //log.warn(await api.database_api.get_all_workers())

        // Get all workers associated with account_id
        //log.warn(await api.database_api.get_workers_by_account('1.2.364315'))

        // Get count of workers
        //log.warn(await api.database_api.get_worker_count())

        // lookup objects these votes are for
        //log.warn(await api.database_api.lookup_vote_ids([]))
        
        //api.database_api.get_transaction_hex(1, hex => log.warn(hex))
        
        // api.database_api.get_margin_positions(
        //     process.env.DEX_USER_ID,
        //     margins => log.warn(margins)
        // )
        //console.log(await api.database_api.get_margin_positions(process.env.DEX_USER_ID))
        //api.close()


        //let trx = await database.get_transaction(24614807, 1)
        
        // Get a hexdump for transaction
        //log.warn(await database.get_transaction_hex(trx))

        // Get potential public keys for transaction
        //let signatures = await database.get_potential_signatures(trx)
    // Wut this do?
    //log.warn(await database.get_required_signatures(trx, signatures))
        
        // Get public keys that could sign this transaction
        //log.warn(await database.get_potential_address_signatures(trx))

        // Does this transaction have the required signatures?
        //log.warn(await database.verify_authority(trx))

    // Validate transaction
    //log.warn(await database.validate_transaction(trx))
        
        //log.warn(await database.verify_account_authority(process.env.DEX_USER_ID, signatures))

        // Get proposed transactions for an account
        //log.warn(await database.get_proposed_transactions(process.env.DEX_USER_ID))

        // Subscribe to... whatever this is
        // let subscription_id = await database.set_subscribe_callback(true)
        
        // database.on(subscription_id, async data => {
        //     log.error(data)

        //     // Unsubscribe
        //     await database.cancel_all_subscriptions()
        // })
    })
})
let x = false
// Doing something with assets after knowing they exist
api.on('store.assets.stored',() => {
    if(!x) {
        log.warn(api.getStoredAsset('CNY'))
        //log.warn(api.getStoredAssets(['CNY', 'BTS']))
        x = true
    }
    //log.warn(api.getStoredAsset('CNY'))
    //api.database_api.lookup_asset_symbols(process.env.ASSET_SYMBOLS)
})

api.on("message", data => {
    if(data.id === 1005) {
        //log.error(data)
    } else {
        //log.warn(data)
    }
})

// How might be best to sanely close connection?

/*
let wallet = new Wallet(process.env.WALLET_NODE)

// This wallet is new, let's set it up
// You will need a password set before anything else can be done
wallet.on("is_new", result => {
    wallet.set_password(process.env.WALLET_PASS)
})

// We've detected that a password has been set
// unlock wallet before proceeding
wallet.on('init', () => {
    wallet.unlock(process.env.WALLET_PASS)
})

wallet.on('unlocked', () => {

    // Determine if our target account exists in the wallet already

    // It is not until this point a wallet.json file is created by wallet_cli
    wallet.import_key(process.env.DEX_USER, process.env.DEX_WIF)
})*/