const WebSocket = require('ws')

class Connection extends WebSocket {
    /**
     * Converts a request object to JSON and sends it
     * @param {object} request 
     */
    send(request) {
        super.send(JSON.stringify(request))
    }

    buildRequest(api_id, id, method, params) {
        return {
            id: id,
            method: "call",
            params: [
                api_id,
                method,
                params
            ]
        }
    }
}

module.exports = Connection