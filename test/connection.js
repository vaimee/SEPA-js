const assert = require('assert');
const Connection = require('../lib/connection');
const WebSocket = require("ws")
const Emitter = require('events').EventEmitter

const sinon = require('sinon')

describe('Connection', function () {
    let fakeWs
    let connection  
    before(() => {
        fakeWs = new Emitter()
        fakeWs.readyState = WebSocket.OPEN
        fakeWs.send = sinon.fake()
        fakeWs.close = sinon.fake()
    });

    beforeEach(() => {
        connection = new Connection(fakeWs)
        fakeWs.send.resetHistory()
        fakeWs.close.resetHistory()
    });
    
    it('should notify the first notification', () => {
        let callback = sinon.fake()
        
        connection.on("test",callback)

        connection.createSubscription({
            subscribe:
                {
                    sparql : "fake",
                    alias : 'test'
                }
        })

        assert(fakeWs.send.called,"Subscription request not sent")
        fakeWs.emit("message",'{"notification":{"spuid":"spuid://test","alias":"test"}}')
        assert(callback.calledOnce,"Callaback not called")
    });
    
    it('should unsubscribe', () => {
        let callback = sinon.fake()

        connection.on("test", callback)

        connection.createSubscription({
            subscribe:
            {
                sparql: "fake",
                alias: 'test'
            }
        })

        fakeWs.emit("message", '{"notification":{"spuid":"spuid://test","alias":"test"}}')
        connection.deleteSubscription('test')
        fakeWs.emit("message", '{"unsubscribed":{"spuid":"spuid://test"}}')

        assert(fakeWs.send.calledTwice, "Subscription request not sent")
        assert(callback.calledTwice, "Callaback not called twice, missing unsubribe notification")
    });
    
    it('should ignore listeners connection releted events', () => {
        let callback = sinon.fake()

        connection.on("test", callback)
        connection.on("error",callback)
        connection.on("newListener",callback)
        connection.on("removeListener",callback)
        
        assert(connection.connectedClients === 1, "Connection client number is more than 1")
    });
    
    it('should ignore not registered listeners', () => {
        let callback = sinon.fake()

        connection.on("test", callback)
        connection.on("error", callback)

        assert(connection.connectedClients === 1, "Connection client number is more than 1")
        
        connection.removeListener("fake",callback)
        connection.removeListener("close",callback)

        assert(connection.connectedClients === 1, "Connection client number is more than 1")
    });

    it('should close the connection', () => {
        let callback = sinon.fake()
        let closeCallback = sinon.fake()

        connection.on("test", callback)
        connection.on("close",closeCallback)

        connection.createSubscription({
            subscribe:
            {
                sparql: "fake",
                alias: 'test'
            }
        })

        fakeWs.emit("message", '{"notification":{"spuid":"spuid://test","alias":"test"}}')
        connection.deleteSubscription('test')
        fakeWs.emit("message", '{"unsubscribed":{"spuid":"spuid://test"}}')
        connection.removeListener("test",callback)

        assert(fakeWs.send.calledTwice, "Subscription request not sent")
        assert(callback.calledTwice, "Callaback not called twice, missing unsubribe notification")
        assert(fakeWs.close.calledOnce, "Connection not closed")
        
        fakeWs.emit("close")
        assert(closeCallback.called,"close callaback not called")

    });

    it('should handle a notification stream', () => {
        let callback = sinon.fake()
        
        connection.on("test",callback)

        connection.createSubscription({
            subscribe:
                {
                    sparql : "fake",
                    alias : 'test'
                }
        })

        assert(fakeWs.send.called,"Subscription request not sent")

        fakeWs.emit("message",'{"notification":{"spuid":"spuid://test","alias":"test"}}')
        fakeWs.emit("message", '{"notification":{"spuid":"spuid://test","alias":"test"}}')
        
        assert(callback.calledTwice,"Callaback not called twice")
    });

    it('should handle different aliases stream', () => {
        let callbackOne = sinon.fake()
        let callbackTwo = sinon.fake()
        
        connection.on("test1",callbackOne)
        connection.on("test2",callbackTwo)

        connection.createSubscription({
            subscribe:
                {
                    sparql : "fake",
                    alias : 'test1'
                }
        })
        
        connection.createSubscription({
            subscribe:
                {
                    sparql : "fake",
                    alias : 'test2'
                }
        })

        fakeWs.emit("message",'{"notification":{"spuid":"spuid://test1","alias":"test1"}}')
        fakeWs.emit("message", '{"notification":{"spuid":"spuid://test2","alias":"test2"}}')
        
        let argumentOne = { 
            notification: { spuid: "spuid://test1", alias: "test1" } 
        }

        let argumentTwo = { 
            notification: { spuid: "spuid://test2", alias: "test2" } 
        }
        
        assert(callbackOne.calledWith(sinon.match(argumentOne)), "Callaback one not called or called with wrong arguments: " + callbackOne.lastCall.args)
        assert(callbackTwo.calledWith(sinon.match(argumentTwo)), "Callaback one not called or called with wrong arguments: " + callbackTwo.lastCall.args)
        

    });

    it('should send the subscription after socket opening', () => {
        fakeWs.readyState = WebSocket.CONNECTING
        

        connection.createSubscription({
            subscribe:
                {
                    sparql : "fake",
                    alias : 'test'
                }
        })

        assert(!fakeWs.send.called,"send called before opening")
        fakeWs.emit("open")
        assert(fakeWs.send.calledOnce,"send not called")
    });

    it('should send the two subscription after socket opening', () => {
        fakeWs.readyState = WebSocket.CONNECTING
        

        connection.createSubscription({
            subscribe:
                {
                    sparql : "fake",
                    alias : 'test'
                }
        })
        connection.createSubscription({
            subscribe:
                {
                    sparql : "fake",
                    alias : 'test'
                }
        })

        assert(!fakeWs.send.called,"send called before opening")
        fakeWs.emit("open")
        assert(fakeWs.send.calledTwice,"send not called twice")
    });

    afterEach(() => {
        fakeWs.readyState = WebSocket.OPEN
    });
    
});
