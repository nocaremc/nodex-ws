'use strict'
const WebSocket = require('ws')
const ws = new WebSocket('wss://la.dexnode.net/ws', {perMessageDeflate: false})

ws.on('open', () => {})