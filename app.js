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
    api.database(database => {
    
    // Here we'll wait for the db api to be initialized
    
        log.success("Database initialized")
        
        // Obtain user_id for a given username
        // api.database_api.get_account_by_name(process.env.DEX_USER, result => {
        //     log.warn(result)
        // })
        
        // Let's grab a list of assets we care about
        // api.database_api.lookup_asset_symbols(process.env.ASSET_SYMBOLS, result => {
        //     log.warn(result)
        // })

        // Grab limit orders for bts:cny (unsure on base/quote)
        // api.database_api.get_limit_orders('1.3.0', '1.3.113', 20, result => {
        //     log.warn(result)
        // })

        // Grab ticker price for bts:cny
        // api.database_api.get_ticker('1.3.0', '1.3.113', result => {
        //     log.warn(result)
        // })

        // Get account balance for cny and usd
        // api.database_api.get_account_balances(
        //     process.env.DEX_USER_ID,
        //     ['1.3.0', '1.3.113'],
        //     result => {
        //         log.warn(result)
        //     }
        // )

        //api.database_api.get_assets(['1.3.113', '1.3.0'], assets => {
            //log.error(assets)
        //})
        
        // Get some random objects
        // api.database_api.get_objects(["2.4.21","2.4.83"], objects => {
        //     log.warn(objects)
        // })
        
        // Get block header
        // api.database_api.get_block_header(24614236, block_header => {
        //     log.warn(block_header)
        // })

        // Get block's headers
        // api.database_api.get_block_header_batch([24614236, 24614695], block_headers => {
        //     log.warn(block_headers)
        // })

        // Get block
        // api.database_api.get_block(24614236, block => {
        //     log.warn(block)
        // })

        // Get a transaction from a block
        api.database_api.get_transaction(24614807, 1, transaction => {
            log.warn(transaction)
        })

    })
})
let x = false
// Doing something with assets after knowing they exist
api.on('store.assets.stored',() => {
    if(!x) {
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