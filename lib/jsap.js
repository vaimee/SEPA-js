const SEPA = require('./sepa');
const Bench = require('./querybench');
const defaults = require('./defaults');

function trasformBindings(bindings = {},forcedBindings={}) {
  let result = {}
  Object.keys(bindings).forEach(k => {
    result[k] = {
      value : bindings[k],
      type : forcedBindings[k] ? forcedBindings[k].type : "literal"
    }
  })
  result = Object.assign(forcedBindings,result)
  return result
}

class Jsap {
  constructor(config = {}) {
    if (typeof config === 'string') {
      config = JSON.parse(config)
    }
    let parameters = Object.assign(defaults,config.parameters)
    this.updates = {}
    this.queries = {}
    Object.assign(this,config)
    this.parameters = parameters
    this.api   = new SEPA(this.parameters)
    this.bench = new Bench(this.namespaces)

    Object.keys(this.updates).forEach(k =>{
      this[k] = binds => {
        return this.update(k,binds)
      }
    })
    Object.keys(this.queries).forEach(k =>{
      if(this[k]){
        delete(this[k])
      }else{
        this[k] = (binds,handler) => {
         return this.subscribe(k,binds,handler)
      }
      }
    })
  }

  subscribe(key,bindings,handler){
    let query = this.queries[key].sparql
    let binds = trasformBindings(bindings,this.queries[key].forcedBindings)
    let forcedBindings = this.queries[key].forcedBindings ? this.queries[key].forcedBindings : {}
    binds = Object.assign(forcedBindings,binds)
    query = this.bench.sparql(query,binds)
    return this.api.subscribe(query,handler)
  }

  update(key,bindings){
    let update = this.updates[key].sparql
    let binds = trasformBindings(bindings,this.updates[key].forcedBindings)
    let forcedBindings = this.updates[key].forcedBindings ? this.updates[key].forcedBindings : {}
    binds = Object.assign(forcedBindings,binds)
    update = this.bench.sparql(update,binds)
    return this.api.update(update);
  }

  producer(key){
    return binds => { this.update(key,binds)}
  }

  consumer(key,handler){
    return binds => { this.subscribe(key,binds,handler)}
  }

  get Producers(){
    let result = {}
    Object.keys(this.updates).forEach(k =>{
      result[k] = binds => {
        return this.update(k,binds)
      }
    })
    return result;
  }

  get Consumers(){
    let result = {}
    Object.keys(this.queries).forEach(k =>{
      result[k] = (binds,handler) => { return this.subscribe(k,binds,handler)}
    })
    return result;
  }
}
module.exports = Jsap;
