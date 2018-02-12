const request = require('request-json')
const log = require('./Log.js')

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

module.exports = WalletRequest