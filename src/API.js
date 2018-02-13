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
        this.login_api_id = 1
        // Maybe we should centralize these so they don't collide?
        this.loginRequestID = 1
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
                this.login_api_id,
                this.loginRequestID,
                "login",
                [
                    user,
                    password
                ]
            )
        // send it
        map.get(this).connection.send(request)
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