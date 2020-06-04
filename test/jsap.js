const assert = require('assert');
const Jsap = require('../lib/jsap.js');
const defaults = require('../lib/defaults');
const test_jsap = require("./jsapconfig")

describe('Jsap', function() {
  describe('#constructor',function() {
    it("empty configuration",function () {
      let jsap = new Jsap()
      assert.ok(jsap.host)
      assert.equal(jsap.sparql11protocol, defaults.sparql11protocol)
      assert.equal(jsap.sparql11seprotocol, defaults.sparql11seprotocol)
    })

    it("from string",function () {
      let jsap = new Jsap(test_jsap)
      assert.ok(jsap.host)
      assert.ok(jsap.extended.thirdparty)
      assert.ok(!jsap.simple)
      assert.ok(!jsap.defaultArgs)
    })

    it("from oject",function () {
      let obj_jsap = {
        host : "test_host.com",
        queries : {
          aquery : {
            sparql : "select * where {?a ?b ?c}"
          }
        }
      }
      let jsap = new Jsap(obj_jsap)
      
      assert.equal(jsap.host,"test_host.com")

      //Check if jsap stores the default configuration
      assert.equal(jsap.sparql11protocol.port, defaults.sparql11protocol.port)
      
      assert.ok(jsap.aquery)
      assert.equal(typeof jsap.aquery,"function")
    })

    it("deep copy",function () {
      let obj_jsap = {
        host : "test_host.com",
        queries : {
          aquery : {
            sparql : "select * where {?a ?b ?c}"
          }
        }
      }
      let jsap = new Jsap(obj_jsap)
      obj_jsap.host = "hello world"
      assert.equal(jsap.host,"test_host.com")
    })

  })

  describe('#update',function(){
    let jsap
    beforeEach(function() {
      jsap = new Jsap(test_jsap)
    });
    it("Check simple update",function () {
      jsap.api.update = (update) => {
        assert.equal(update,"PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> INSERT { <hello> <from> <js> }WHERE{}")
      }
      jsap.update("simple")
    })
    it("Check update with defaults",function () {
      jsap.api.update = (update) => {
        assert.equal(update,"PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> INSERT {<hello> <from> 'Italy'}WHERE{}")
      }
      jsap.update("defaultArgs",{obj:"Italy"})
    })

		it("Check update with defaults override",function () {
      jsap.api.update = (update) => {
        assert.equal(update,"PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> INSERT {<Bye> <from> 'Italy'}WHERE{}")
      }
      jsap.update("defaultArgs",{obj:"Italy",sub:"Bye"})
    })
		it("Check override configuration",function () {
      jsap.api.update = (update,config) => {
        assert.equal(config.sparql11protocol.port,7000)
        assert.equal(config.sparql11protocol.update.format,"XML")
      }
      jsap.update("costumProtocol",)
    })
  })

  describe('#subscribe&query',function(){
    let jsap
    beforeEach(function() {
      jsap = new Jsap(test_jsap)
    });

    it("Check simple subscribe",function () {
			jsap.api.subscribe = (query) => {
        assert.equal(query,"PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> select * where{?a ?b ?c}")
      }
      jsap.subscribe("simple")
    })

    it("Check subscribe with defaults",function () {
      jsap.api.update = (update) => {
        assert.equal(update,"PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> INSERT {<hello> <from> 'Italy'}WHERE{}")
      }
      jsap.update("defaultArgs",{obj:"Italy"})
    })

    it("Check override configuration", function () {
      jsap.api.subscribe = (query, config) => {
        assert.equal(config.sparql11seprotocol.protocol, "wss")
        assert.equal(config.host, "other.host.it")
      }
      jsap.subscribe("costumProtocol" )
    })

    it('Should do a simple query', () => {
      jsap.api.query = (query) => {
        assert.equal(query, "PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> select * where{?a ?b ?c}")
      }
      jsap.query("simple")
    });

    it('Should do add a query function', () => {
      assert.equal(typeof jsap.integration.query,"function") 
    });
    it('Should call a query function', () => {
      jsap.api.query = (query) => {
        assert.ok(true)
      }
      jsap.integration.query()
    });
  })

  describe('producer',function(){
    let jsap
    beforeEach(function() {
      jsap = new Jsap(test_jsap)
    });
    it("call a producer",function () {
      jsap.api.update = (update) => {
        assert.equal(update,"PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> INSERT { <hello> <from> <js> }WHERE{}")
      }
      jsap.producer("simple")()
    })
    it("call a prducer with bindings",function () {
      jsap.api.update = (update) => {
        assert.equal(update,"PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> INSERT {<hello> <from> 'Italy'}WHERE{}")
      }
      jsap.producer("defaultArgs")({obj:"Italy"})
    })
    it("call a prducer from producers ",function () {
      jsap.api.update = (update) => {
        assert.equal(update,"PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> INSERT {<hello> <from> 'Italy'}WHERE{}")
      }
      jsap.Producers.defaultArgs({obj:"Italy"})
    })
    it("call a prducer from jsap ",function () {
      var config = {
        updates : {
          baseUp : {sparql : "insert{<a> <b> ?obj}where{}"}
        }
      }
      jsap = new Jsap(config)
      jsap.api.update = (update) => {
        assert.equal(update,"insert{<a> <b> 'Italy'}where{}")
      }
      jsap.baseUp({obj:"Italy"})
    })
  })

  describe('consumer',function(){
    let jsap
    beforeEach(function() {
      jsap = new Jsap(test_jsap)
    });
    it("call a consumer",function () {
      jsap.api.subscribe = (query) => {
        assert.equal(query,"PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> select * where{?a ?b ?c}")
      }
      jsap.consumer("simple")()
    })
    it("call a consumer with bindings",function () {
      jsap.api.subscribe = (query) => {
        assert.equal(query,"PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> select * where{<Italy> ?b ?c}")
      }
      jsap.consumer("defaultArgs")({a:"Italy"})
    })
    it("call a consumer from Consumers ",function () {
			jsap.api.subscribe = (query) => {
        assert.equal(query,"PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> select * where{<Italy> ?b ?c}")
      }
      jsap.Consumers.defaultArgs({a:"Italy"})
    })
    it("call a consumer from jsap ",function () {
      var config = {
        queries : {
          baseQ : {sparql : "select * where{?a ?b ?c}"}
        }
      }
      jsap = new Jsap(config)
			jsap.api.subscribe = (query) => {
        assert.equal(query,"select * where{?a ?b ?c}")
      }
      jsap.baseQ({obj:"Italy"})
    })
  })
})
