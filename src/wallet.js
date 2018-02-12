const request = require('request-json')
const log = require('./log.js')
const EventEmitter = require('events').EventEmitter

let map = new WeakMap()

class WalletRequest {
    constructor(address) {
        map.set(this, {
            id: 1,
            method: "",
            params:[],
            client: request.createClient(address)
        })
    }

    get client() {
        return map.get(this).client
    }
    set client(address) {
        map.get(this).client = request.createClient(address)
    }

    get id() {
        return map.get(this).id
    }
    set id(id) {
        map.get(this).id = id
    }

    set method(name) {
        map.get(this).method = name
    }
    get method() {
        return map.get(this).method
    }

    set params(params) {
        if(!Array.isArray(params) && typeof params !== "undefined") {
            log.error('params were not an array')
        }
        map.get(this).params = params
    }
    get params() {
        return map.get(this).params
    }

    get request() {
        return {
            jsonrpc: "2.0",
            id: this.id,
            method: this.method,
            params: this.params
        }
    }

    prepare(method, params) {
        this.method = method
        this.params = params
    }

    reset() {
        this.method("")
        this.params([])
    }

    post(callback) {
        //log.success(this.request)
        this.client.post("/", this.request)
            .then(callback)
            .catch(log.error)
    }

    static isOk(result) {
        return result.res.statusCode === 200 
            && result.res.statusMessage === "OK"
    }

    static isTrue(result) {
        return result.body.result === true
    }
    
    static isFalse(result) {
        return result.body.result === false
    }

    /* Result is a 200 OK with a returned value of true */
    static passes(result) {
        return WalletRequest.isOk(result) && WalletRequest.isTrue(result)
    }
}

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
            if(WalletRequest.isOK(result)) {
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