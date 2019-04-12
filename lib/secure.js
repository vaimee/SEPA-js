const SEPA = require("./sepa")
const Subscription = require("./subscription") 
const EventEmitter = require('events').EventEmitter
const axios = require('axios')
const https = require('https')
const WebSocket = require('isomorphic-ws');
//Default self-signed sepa certificate
const ca = `
Bag Attributes
    friendlyName: sepakey
    localKeyID: 54 69 6D 65 20 31 35 35 33 32 34 39 38 34 33 33 34 36
subject=/C=IT/ST=Bologna/L=Bologna/CN=localhost
issuer=/C=IT/ST=Bologna/L=Bologna/CN=localhost
-----BEGIN CERTIFICATE-----
MIIDKTCCAhGgAwIBAgIEbMARRzANBgkqhkiG9w0BAQsFADBFMQswCQYDVQQGEwJJ
VDEQMA4GA1UECBMHQm9sb2duYTEQMA4GA1UEBxMHQm9sb2duYTESMBAGA1UEAxMJ
bG9jYWxob3N0MB4XDTE5MDMyMjEwMDg1M1oXDTIwMDMxNjEwMDg1M1owRTELMAkG
A1UEBhMCSVQxEDAOBgNVBAgTB0JvbG9nbmExEDAOBgNVBAcTB0JvbG9nbmExEjAQ
BgNVBAMTCWxvY2FsaG9zdDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB
AJZ9ajuqEqXGU5QAWyMG3w4hScec9BXjOwDeqseSDDxOx/KuHCG5JDTiQzmPBT96
LLUGTn+c2l2c+Ezm4Dk11qjpJ+aiiv+gGvyNJmpw/+UwW7wp13O9sMr21GZxexmZ
/xV/nsXFXXoUurCwZecTzQ6UcNvrvlUy7NVr2TU+ZpwWR/DyKhxe452VJlEaP9Yk
Zu/g9x9rYMs7iG4qErQnGhGS6ds8fU6VrzPCAW9EFxC1SN7r2xnPREU/igv0SilX
e+tPk167l1wgGyBl3K4Ep7O8RoSE/EhyuooZ9oVenqD/MRlKLso1O2Kv7DslrBpv
8UufAWxwwEOhDA3XXfblsDkCAwEAAaMhMB8wHQYDVR0OBBYEFCxDyoFe03ccASA9
JfyvYFEAStceMA0GCSqGSIb3DQEBCwUAA4IBAQBvWzC0qLNhp8L9GkoaNtNKJGEu
WQkqaMDBtrD4Jy+I75/k73ivvwVgbgg0kq9+jYC48tWwcBsDzqNau+Zay4rWZlf9
qbnP3+j4hgLIBPrAAvxWQBzLrVOkZK1hXdrS1fNCFmYdIwlEU7M06C3mv69CD/yJ
vJF2FczexVR2I2L15JdpVlqZ35KwQ8QRTKTtwvQxZeZG56g+Db0vGMMwJqSpPRZc
WdUXV+2aTVZWdO3avHXkS/qZ0A+8HX8bVvm8O/5b21bIo9BfCf3za3/CAVSNFfNp
VfDUVhC465CzJcei94rxKyjWTuVl7CZA+6e2x5Ua/4tASi0sFFAlqGJIpiXr
-----END CERTIFICATE-----
`
const  httpsAgent = new https.Agent({ ca: [ca] })

function register(clientID, config){
    let body = {
        register: {
            client_identity: clientID,
            grant_types: ["client_credentials"]
        },
        httpsAgent : httpsAgent
    }
    return axios.post("https://localhost:8443/oauth/register", JSON.stringify(body), {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        httpsAgent : httpsAgent
    }).then((res) => {
        let clientID = res.data.credentials.client_id
        let clientSecret = res.data.credentials.client_secret
        config.sparql11protocol.protocol = "https"
        config.sparql11protocol.query.path = "/secure/query"
        config.sparql11protocol.update.path = "/secure/update"
        config.sparql11protocol.port = 8443
        config.sparql11seprotocol.protocol = "wss"
       
        return new SecureSEPA(clientID,clientSecret,config)
    })
}

class SecureSEPA extends SEPA {

    constructor(clientID,clientSecret,parameters){
        super(parameters)
        this.clientID = clientID
        this.clientSecret = clientSecret
        super._wsFactory = (uri) => {
            return new WebSocket(uri,{ca: ca})
        }
        this.webToken = undefined
        this.maxTokenRetries = 2
    }
    
    async query(query, config){
        
        if(!this.webToken){
            this.webToken = await this._retriveToken()
        }

        config = this._setHeaders(config)

        return this._autoRenewToken(super.query.bind(this),query,config,0)
    }

    async update(update, config){
        if (!this.webToken) {
            this.webToken = await this._retriveToken()
        }

        config = this._setHeaders(config)
        return this._autoRenewToken(super.update.bind(this), update, config, 0)
    }

    async subscribe(query, config, alias){
        if (!this.webToken) {
            this.webToken = await this._retriveToken()
        }
        
        let auth = this.webToken.token_type.charAt(0).toUpperCase() + this.webToken.token_type.slice(1) + " " + this.webToken.access_token

        if(config){
            if(config.options){
                config.options.authorization = auth
            }else{
                config.options = {authorization : auth}
            }            
        }else{
            config = {options: {authorization: auth}}
        }

        
        
        
        return new SecureSubscriptionWrapper(super.subscribe(query,config,alias),config,this)
    }

    _retriveToken(){
        let credentials = Buffer.from(this.clientID+":"+this.clientSecret).toString("base64")
        return axios.post("https://localhost:8443/oauth/token", "", {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization : "Basic "+credentials
            },
            httpsAgent : httpsAgent
        }).then((response) => {
            return response.data.token
        })
    }

    _autoRenewToken(oper,arg,config,callTimes){
        if(callTimes >= this.maxTokenRetries){
            return Promise.reject("Max token regeneration requests")
        }

        return oper(arg,config).catch((e) => {
            if (e.response && e.response.status === 400) {
                return this._retriveToken().then((token) => {
                    this.webToken = token
                    this._setHeaders(config)
                }).then(() => this._autoRenewToken(oper, arg, config,callTimes++))
            }
            return e
        })
    }

    _setHeaders(clientConfig){
        let config = {} 
        Object.assign(config,clientConfig)
        let auth = this.webToken.token_type.charAt(0).toUpperCase() + this.webToken.token_type.slice(1) + " " + this.webToken.access_token
        if (!config) {
            config = {
                options: {
                    headers: {
                        Authorization: auth
                    }
                }
            }
        } else if (config && !config.options) {
            config.options = {
                headers: {
                    Authorization: auth
                },
                
            }
        } else if (config && config.options && !config.options.headers) {
            config.options.headers = {
                Authorization: auth
            }
        } else {
            config.options.headers.Authorization = auth
            
        }
        config.options.httpsAgent = httpsAgent
        return config
    }

    
}

class SecureSubscriptionWrapper extends EventEmitter{

    constructor(sub,config, secureClient){
        super()
        this._config = config
        this._secureClient = secureClient
        this._forwardSubEvents(sub)
        this._unsubcribing = false
    }

    emit(name,object){
        if(name === "error" && object.error && object.status_code === 400 && !this._unsubcribing){
            this._secureClient._retriveToken().then(token => {
                this._secureClient.webToken = token
                this._sub.kill()
                return this._secureClient.subscribe(this.query, this._config,this.alias)
            }).then(sub => {
                this._forwardSubEvents(sub)
            })
        } else if (name === "error" && object.error && object.status_code === 400 && this._unsubcribing){
            this._secureClient._retriveToken().then(token => {
                let auth = token.token_type.charAt(0).toUpperCase() + token.token_type.slice(1) + " " + token.access_token
                this._sub.options.authorization = auth
                this._secureClient.webToken = token
                this.unsubscribe()
            })
        }else{
            super.emit(name,object)
        }
    }

    get alias (){
        return this._sub.alias
    }

    get query() {
        return this._sub.query
    }

    unsubscribe(){
        this._unsubcribing = true
        this._sub.unsubscribe()
    }

    kill(){
        this._sub.kill()
    }

    _forwardSubEvents(sub){
        this._sub = sub

        let forward = name => {
            return (event => {
                this.emit(name,event)
            }).bind(this)
        }

        sub.on("subscribed", forward("subscribed"))
        sub.on("unsubscribed", forward("unsubscribed"))
        sub.on("notification", forward("notification"))
        sub.on("added", forward("added"))
        sub.on("removed",forward("removed"))
        sub.on("error", forward("error"))
        sub.on("connection-error", forward("connection-error"))
    }

    

}
module.exports = {
    register : register
}