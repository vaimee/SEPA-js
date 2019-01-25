const axios = require('axios');
const WebSocket = require('isomorphic-ws');
const utils = require('./utils');
const Observable = require('zen-observable');
const Connection = require('./connection')
const Subscription = require('./subscription')


class SEPA {

  constructor(parameters) {
    this.config = parameters
    this.queryURI = utils.createURI('http', parameters.host, parameters.sparql11protocol.port, parameters.sparql11protocol.query.path)
    this.updateURI = utils.createURI('http', parameters.host, parameters.sparql11protocol.port, parameters.sparql11protocol.update.path)

    this.connectionPool = new Map()

    let subprotcol = parameters.sparql11seprotocol.protocol
    let selectSubProtocol = parameters.sparql11seprotocol.availableProtocols[subprotcol]
    this.subscribeURI = utils.createURI('ws', parameters.host, selectSubProtocol.port, selectSubProtocol.path)
  }

  query(query,config) {
    let q_uri = this.queryURI
    if ( config !== undefined){
      let temp = utils.mergeWithDefaults(this.config,config)
      q_uri = utils.createURI('http', temp.host, temp.sparql11protocol.port, temp.sparql11protocol.query.path)
    }
    console.log(q_uri);;
    return axios.post(q_uri,query, {"headers" : {
      "Content-Type":"application/sparql-query",
    }}).then(function(response) {
       return response.data;
    })
  }

  update(update,config) {
    let up_uri = this.updateURI
    if ( config !== undefined){
      let temp = utils.mergeWithDefaults(this.config,config)
      up_uri = utils.createURI('http', temp.host, temp.sparql11protocol.port, temp.sparql11protocol.update.path)
    }

    return axios.post(up_uri,update, {"headers" : {
      "Content-Type":"application/sparql-update",
    }}).then(function(response) {
      return {"status" : response.status,
              "statusText" : response.statusText
      };
    })
  }

  subscribe (query,config,alias) {
    let sub_uri = this.subscribeURI
    if ( config !== undefined){
      let temp = utils.mergeWithDefaults(this.config,config)
      let subprotcol = temp.sparql11seprotocol.protocol
      let selectSubProtocol = temp.sparql11seprotocol.availableProtocols[subprotcol]
      sub_uri = utils.createURI('ws', temp.host, selectSubProtocol.port, selectSubProtocol.path)
    }

    let connection = this.connectionPool.get(sub_uri)
    
    if(!connection){
      connection = new Connection(new WebSocket(sub_uri))
      this.connectionPool.set(sub_uri,connection)
      connection.on("close",(()=>{this.connectionPool.delete(sub_uri)}).bind(this))
    }

    return new Subscription(query,connection,alias)
  }
}

module.exports = SEPA;
