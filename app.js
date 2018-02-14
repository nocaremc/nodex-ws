const dotenv = require('dotenv')
const log = require('./src/Log.js')
const Wallet = require('./src/Wallet.js')
const API = require('./src/API.js')
// Load environment variables
dotenv.load()



let api = new API(process.env.RPC_NODE, {perMessageDeflate: false})

//
api.on("open", () => {
    log.success("Websocket ready")
    api.login(process.env.DEX_USER, process.env.DEX_PASS)
})

api.on("message", data => {
    log.success(data)
})
//this.ws.on('open', this.open)
//this.ws.on('message', this.message)
//this.ws.on('error', log.error)
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