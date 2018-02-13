const log = require('./Log.js')
let map = new WeakMap()

/**
 * This is our main gateway api class
 * Further reading: http://docs.bitshares.org/api/access.html
 */
class API {
    constructor(connection) {
        map.set(this, {
            connection: connection
        })
        API.login_api_id = 1
        // Maybe we should centralize these so they don't collide?
        API.loginRequestID = 1

        connection.on("message", this.message)
    }

    /**
     * Authenticate to the RPC server.
     * @param {string} user 
     * @param {string} password 
     */
    login(user, password) {
        // Build a login request
        let request = map.get(this).connection
            .buildRequest(
                API.login_api_id,
                API.loginRequestID,
                "login",
                [
                    user,
                    password
                ]
            )
        // send it
        map.get(this).connection.send(request)
    }

    message(data) {
        data = JSON.parse(data)
        switch(data.id) {

            case API.loginRequestID:
                if(data.result === true) {
                    log.success("Logged in")
                } else {
                    log.error("Unable to log in")
                }
            break;

            default:
                // don't care here
            break;
        }
    }
    
    /*
    block() {}
    network_broadcast() {}
    database() {}
    history() {}
    network_node() {}
    crypto() {}
    asset() {}
    debug() {}
    enable_api() {}
    */
}

module.exports = API