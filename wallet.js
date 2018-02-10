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

    reset() {
        this.method("")
        this.params([])
    }

    post(callback) {
        log.warn(this.request)
        this.client
            .post("/", this.request)
            .then(callback)
            .catch(log.error)
    }
}

class Wallet {
    /**
     * Properties
     * 
     * client
     * request
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
            this.emit("wallet::is_new", result)
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