const dotenv = require('dotenv')
const log = require('./log.js')
const Wallet = require('./wallet.js')

// Load environment variables
dotenv.load()

log.success('We have logged some shit!')
let wallet = new Wallet(process.env.WALLET_NODE)

wallet.on("wallet::is_new", (result) => {
    // wallet is new
})

