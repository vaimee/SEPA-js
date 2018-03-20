const assert = require('assert');
const Jsap = require('../lib/jsap.js');
const defaults = require('../lib/defaults');
const test_jsap = require("./jsapconfig")

describe('Jsap', function() {
  describe('#constructor',function() {
    it("empty configuration",function () {
      let jsap = new Jsap()
      assert.ok(jsap.parameters)
      assert.equal(jsap.parameters, defaults)
    })

    it("from string",function () {
      let jsap = new Jsap(test_jsap)
      assert.ok(jsap.parameters)
      assert.ok(jsap.extended.thirdparty)
      assert.ok(!jsap.simple)
      assert.ok(!jsap.defaultArgs)
    })

    it("from oject",function () {
      let obj_jsap = {
        parameters : { host : "test_host.com"},
        queries : {
          aquery : {
            sparql : "select * where {?a ?b ?c}"
          }
        }
      }
      let jsap = new Jsap(obj_jsap)
      assert.ok(jsap.parameters)
      assert.equal(jsap.parameters.host,"test_host.com")
      assert.equal(jsap.parameters.ports,defaults.ports)
      assert.ok(jsap.aquery)
      assert.equal(typeof jsap.aquery,"function")
    })

    it("deep copy",function () {
      let obj_jsap = {
        parameters : { host : "test_host.com"},
        queries : {
          aquery : {
            sparql : "select * where {?a ?b ?c}"
          }
        }
      }
      let jsap = new Jsap(obj_jsap)
      obj_jsap.parameters.host = "hello world"
      assert.equal(jsap.parameters.host,"test_host.com")
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
  })

  describe('#subscribe',function(){
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
