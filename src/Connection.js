const WebSocket = require('ws')

class Connection extends WebSocket {
    
    /**
     * Converts a request object to JSON and sends it
     * @param {object} request 
     */
    send(request) {
        super.send(JSON.stringify(request))
    }

    /**
     * Return a request prepared to be sent to active rpc node
     * @param {string} api_id Graphene API ID
     * @param {string} request_id 
     * @param {string} method Graphene method name
     * @param {array} params Graphene method parameters
     */
    buildRequest(api_id, request_id, method, params) {
        return {
            id: request_id,
            method: "call",
            params: [
                api_id,
                method,
                params
            ]
        }
    }

    /**
     * Send a request prepared to be sent to active rpc node
     * @param {string} api_id Graphene API ID
     * @param {string} request_id 
     * @param {string} method Graphene method name
     * @param {array} params Graphene method parameters
     */
    request(api_id, request_id, method, params) {
        let request = this.buildRequest(api_id, request_id, method, params)
        this.send(request)
    }

    // LATER: heartbeat, node list, switching
}

module.exports = Connection