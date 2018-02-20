// cheatsheet
// https://gist.github.com/yoavniran/1e3b0162e1545055429e 
const chai = require('chai')
const Connection = require('../src/Connection.js')
const WebSocket = require('ws')

chai.should()

let connection = new Connection(
    'wss://la.dexnode.net/ws', {perMessageDeflate: false}
)

describe('Connection()', () => {

    it('is a WebSocket', () => {
        connection.should.be.instanceof(WebSocket)
    })

    describe('buildRequest()', () => {
        let request;

        beforeEach(() => {
            request = connection.buildRequest(
                1, // login api id
                1, // requset id
                "login", // method name
                [] // params
            )
        })

        it('returns an object', () => {
            request.should.be.an('object')
        })

        describe('.id', () => {
            it('exists', () => {
                request.should.have.own.property('id')
            })

            it('should be 1', () => {
                request.id.should.equal(1)
            })
        })

        describe('.method', () => {
            it('exists', () => {
                request.should.have.own.property('method')
            })

            it('equals \'call\'', () => {
                request.method.should.equal('call')
            })
        })

        describe('.params', () => {
            it('exists', () =>{
                request.should.have.own.property('params')
            })

            it('is an array', () => {
                request.params.should.be.an('array')
            })

            it('of length 3', () => {
                request.params.length.should.equal(3)
            })

            it('eql to [1, \'login\', []]', () => {
                request.params.should.eql([1,'login',[]])
            })
        })
    })

    return true
})