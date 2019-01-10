const axios = require('axios');
const WebSocket = require('isomorphic-ws');
const utils = require('./utils');
const Observable = require('zen-observable');
const Connection = require('./connection')


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

  subscribe (query,observer,config,alias) {
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

    let observable = new Observable(obs => {
      //Math random esure that the alias is unique but is not secure (cripto)
      alias = alias ? alias : Math.random().toString(26).slice(2)
      let request = {
        subscribe : {
          sparql : query,
          alias: alias
        }
      }

      let handler = function (notification) {
        
        if (notification.unsubscribed) {
          obs.complete(notification.unsubscribed.spuid)
          connection.removeListener(alias,handler)
        } else if (notification.error){
          connection.removeListener(alias, handler)
          obs.error(notification)
        }else{
          obs.next(notification)
        }
      }

      connection.on(alias,handler)
      connection.on("error",obs.error)

      connection.createSubscription(request)

      return () => {
        connection.deleteSubscription(alias)
      }
    });

    return observable.subscribe(observer)
  }
}

module.exports = SEPA;
