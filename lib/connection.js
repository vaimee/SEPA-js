const EventEmitter = require("events").EventEmitter
const WebSocket = require("ws")

class Connection extends EventEmitter {

    constructor(websocket) {
        super()

        this.aliasMapping = new Map()
        this.reverseAliasMapping = new Map()

        this.ws = websocket
        this.connectedClients = 0

        this.on("newListener", ((event) => {
            //Exclude connection managment events
            //Count only sparql subscription listeners
            if (event !== "close" && event !== "error" && event !== "removeListener" && event !== "newListener"){
                this.connectedClients++
            }
        }).bind(this))

        this.on("removeListener", ((event) => {
            //Discard fake or system  listener
            if (this.reverseAliasMapping.has(event)){  
                this.connectedClients--
            }

            if (this.connectedClients <= 0) {
                this.emit("close")
                this.ws.close()
            }

        }).bind(this))

        //reset connectclients after removeListener handler
        this.connectedClients = 0

        this.ws.on("message", data => {
            data = JSON.parse(data)
            data["toString"] = () => { return JSON.stringify(data) }


            if (data.error) {
                //register alias for correct listener deregistration
                this.reverseAliasMapping.set(data.alias, "")
                this.emit(data.alias, data)
            } else if (data.unsubscribed){
                this.emit(this.aliasMapping.get(data.unsubscribed.spuid), data)                
            }else{
                if (data.notification.alias) {
                    this.aliasMapping.set(data.notification.spuid, data.notification.alias)
                    this.reverseAliasMapping.set(data.notification.alias, data.notification.spuid)
                }
                this.emit(this.aliasMapping.get(data.notification.spuid), data)
            }
        })

        this.ws.on("error", (err => {
            this.emit("error", err)
        }).bind(this))
    }

    createSubscription(request) {
        if (this.ws.readyState === WebSocket.CONNECTING) {
            this.ws.once("open", (() => { this.ws.send(JSON.stringify(request)) }).bind(this))
        }else{
            this.ws.send(JSON.stringify(request))
        }
    }

    deleteSubscription(alias) {
        if (this.ws.readyState !== WebSocket.CLOSED && this.ws.readyState !== WebSocket.CLOSING){
            let unsubscribe = { unsubscribe: { spuid: this.reverseAliasMapping.get(alias) } }
            this.ws.send(JSON.stringify(unsubscribe))
        }
    }

}

module.exports = Connection