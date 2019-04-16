const axios = require('axios');
const WebSocket = require('isomorphic-ws');
const utils = require('./utils');
const Connection = require('./connection')
const Subscription = require('./subscription')


class SEPA {

  constructor(parameters) {
    this.config = parameters
    this.queryURI = utils.createURI(parameters.sparql11protocol.protocol, parameters.host, parameters.sparql11protocol.port, parameters.sparql11protocol.query.path)
    this.updateURI = utils.createURI(parameters.sparql11protocol.protocol, parameters.host, parameters.sparql11protocol.port, parameters.sparql11protocol.update.path)

    this.connectionPool = new Map()

    let subprotcol = parameters.sparql11seprotocol.protocol
    let selectSubProtocol = parameters.sparql11seprotocol.availableProtocols[subprotcol]
    this.subscribeURI = utils.createURI(subprotcol, parameters.host, selectSubProtocol.port, selectSubProtocol.path)

    this._wsFactory = (uri) => {
      return new WebSocket(uri)
    } 
  }

  query(query,config) {
    let q_uri = this.queryURI
    let axiosConfig = this.config
    if ( config !== undefined){
      axiosConfig = mergeConfigurations(this.config,config)
      q_uri = utils.createURI(axiosConfig.sparql11protocol.protocol, axiosConfig.host, axiosConfig.sparql11protocol.port, axiosConfig.sparql11protocol.query.path)
    }
    
    axiosConfig = setHeadersIfUndefined(axiosConfig, { "Content-Type": "application/sparql-query" })

    return axios.post(q_uri,query, axiosConfig.options).then(function(response) {
       return response.data;
    })
  }

  update(update,config) {
    let up_uri = this.updateURI
    let axiosConfig = this.config
    if (config !== undefined) {
      axiosConfig = mergeConfigurations(this.config, config)
      up_uri = utils.createURI(axiosConfig.sparql11protocol.protocol, axiosConfig.host, axiosConfig.sparql11protocol.port, axiosConfig.sparql11protocol.update.path)
    }
    axiosConfig = setHeadersIfUndefined(axiosConfig, { "Content-Type": "application/sparql-update" })
    return axios.post(up_uri, update, axiosConfig.options).then(function(response) {
      return {"status" : response.status,
              "statusText" : response.statusText
      };
    })
  }

  subscribe (query,config,alias) {
    let sub_uri = this.subscribeURI
    let subConfig = this.config
    if ( config !== undefined){
      subConfig = mergeConfigurations(this.config,config)
      let subprotcol = subConfig.sparql11seprotocol.protocol
      let selectSubProtocol = subConfig.sparql11seprotocol.availableProtocols[subprotcol]
      sub_uri = utils.createURI(subprotcol, subConfig.host, selectSubProtocol.port, selectSubProtocol.path)
    }

    let connection = this.connectionPool.get(sub_uri)
    
    if(!connection){
      connection = new Connection(this._wsFactory(sub_uri))
      this.connectionPool.set(sub_uri,connection)
      connection.on("close",(()=>{this.connectionPool.delete(sub_uri)}).bind(this))
    }
    let options = subConfig ? subConfig.options : {}
    return new Subscription(query,connection,alias,options)
  }
  
}

function setHeadersIfUndefined(config,headers) {
  config = Object.assign({},config)
  if(!config.options) config.options = {headers : {}}
  if(!config.options.headers) config.options.headers = {}

  Object.keys(headers).forEach((key) => {
    if (!config.options.headers.hasOwnProperty(key)){
      config.options.headers[key] = headers[key]
    }  
  })
  return config
}

function mergeConfigurations(defaults,user){
  let result
  
  if (user.options && user.options.httpsAgent) {
    let agent = user.options.httpsAgent
    delete user.options.httpsAgent
    result = utils.mergeWithDefaults(defaults, user)
    //ripristinate config
    user.options.httpsAgent = agent
    result.options.httpsAgent = agent

  } else {
    let agent = defaults.options.httpsAgent
    delete defaults.options.httpsAgent
    result = utils.mergeWithDefaults(defaults, user)
    defaults.options.httpsAgent = agent
    defaults.options.httpsAgent = agent
  }

  return result
}

module.exports = SEPA;
