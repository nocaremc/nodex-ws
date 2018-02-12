const log = require('./Log.js')
const WalletRequest = require('./WalletRequest.js')
const EventEmitter = require('events').EventEmitter

let map = new WeakMap()

class Wallet {
    /**
     * Properties
     * 
     * client
     * events: EventEmitter
     * 
     */
    constructor(address) {
        if(!address) {
            log.error('A wallet node address is required!')
        }

        map.set(this, {
            client: new WalletRequest(address),
            events: new EventEmitter()
        })

        this.is_new()
    }

    get client() {
        return map.get(this).client
    }

    is_new() {
        this.client.method = "is_new"
        
        this.client.post((result) => {
            if(WalletRequest.passes(result)) {
                log.warn("Wallet is new.")
                this.emit("is_new", result)

            } else if(WalletRequest.isFalse(result)) {
                log.success("Wallet is not new.")
                this.emit("init")

            } else {
                log.error("Could not determine is_new status of wallet")
            }
        })
    }

    set_password(password) {
        this.client.prepare("set_password", [password])
        this.client.post((result) => {
            if(WalletRequest.isOk(result)) {
                log.success("Wallet password has been set.")
                this.emit("init")
            } else {
                log.error("Something went wrong in set_password")
            }
        })
    }

    unlock(password) {
        this.client.prepare("unlock", [password])
        this.client.post((result) => {
            if(WalletRequest.isOk(result)) {
                log.success("Wallet unlocked.")
                this.emit("unlocked")
            }
        })
    }

    import_key(account, wif_key) {
        this.client.prepare("import_key", [account, wif_key])
        this.client.post((result) => {
            if(WalletRequest.passes(result)) {
                log.success("Imported WIF key for account: " + account + ".")
            }
        })
    }

    on(event, callback) {
        map.get(this).events.on(event, callback)
    }

    emit(event, data) {
        map.get(this).events.emit(event, data)
    }
}

module.exports = Wallet