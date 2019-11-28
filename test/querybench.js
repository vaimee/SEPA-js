const assert = require('assert');
const Bench = require('../lib/querybench.js');

describe('querybench', function() {
  it('test empty query', function() {
    bench = new Bench()
    assert.equal("", bench.sparql("",{}))
  });
  it('test initializated namespaces', function() {
    namespaces = {
      test : "hello",
      pippo : "world"
    }
    bench = new Bench(namespaces)
    assert.equal("PREFIX test:<hello> PREFIX pippo:<world>", bench.sparql("",{}))
  });
  it('test initializated namespaces with query no bindgs', function() {
    namespaces = {
      test : "hello",
      pippo : "world"
    }
    bench = new Bench(namespaces)
    query = bench.sparql("select * where{?a ?b ?c}",{})
    assert.equal("PREFIX test:<hello> PREFIX pippo:<world> select * where{?a ?b ?c}",query )
  });
  it('test initializated namespaces with query and bindgs', function() {
    namespaces = {
      test : "hello",
      pippo : "world"
    }
    bench = new Bench(namespaces)
    query = bench.sparql("select * where{?a ?b ?c}",{a:{
      value :"hello"
    }})
    assert.equal("PREFIX test:<hello> PREFIX pippo:<world> select * where{hello ?b ?c}",query )
  });
  it('test initializated namespaces with query and bindgs with more occurences', function() {
    namespaces = {
      test : "hello",
      pippo : "world"
    }
    bench = new Bench(namespaces)
    query = bench.sparql("select * where{?a ?b ?c. ?a ?d ?f}",{a:{
      value :"hello"
    }})
    assert.equal("PREFIX test:<hello> PREFIX pippo:<world> select * where{hello ?b ?c. hello ?d ?f}",query )
  });

  it('test bindings literal', function() {
    namespaces = {
      test : "hello",
      pippo : "world"
    }
    bench = new Bench(namespaces)
    query = bench.sparql("select * where{?a ?b ?c}",{a:{
      type : "literal",
      value :"hello"
    }})
    assert.equal("PREFIX test:<hello> PREFIX pippo:<world> select * where{'hello' ?b ?c}",query )
  });

  it('test bindings literal number', function() {
    namespaces = {
      test : "hello",
      pippo : "world"
    }
    bench = new Bench(namespaces)
    query = bench.sparql("select * where{?a ?b ?c}",{c:{
      type : "literal",
      value : 3
    }})
    assert.equal("PREFIX test:<hello> PREFIX pippo:<world> select * where{?a ?b 3}",query )
  });

  it('test bindings uri', function() {
    namespaces = {
      test : "hello",
      pippo : "world"
    }
    bench = new Bench(namespaces)
    query = bench.sparql("select * where{?a ?b ?c}",{a:{
      type : "uri",
      value :"hello"
    }})
    assert.equal("PREFIX test:<hello> PREFIX pippo:<world> select * where{<hello> ?b ?c}",query )
  });

  it('it should substitute only the binding name', function () {
    namespaces = {
      test: "hello",
      pippo: "world"
    }
    bench = new Bench(namespaces)
    query = bench.sparql("select * where{?a ?ab ?c}", {
      a: {
        type: "uri",
        value: "hello"
      }
    })
    assert.equal("PREFIX test:<hello> PREFIX pippo:<world> select * where{<hello> ?ab ?c}", query)
  });
  it('it shouldnt use the <> notation' , function () {
    namespaces = {
      test: "hello",
      pippo: "world"
    }
    bench = new Bench(namespaces)
    query = bench.sparql("select * where{?a ?ab ?c}", {
      a: {
        type: "uri",
        value: "test:hello"
      }
    })
    assert.equal("PREFIX test:<hello> PREFIX pippo:<world> select * where{test:hello ?ab ?c}", query)
  });
  it('it should replace variable even if it is followed by . (dot)' , function () {
    bench = new Bench({})
    query = bench.sparql("select * where{?a ?ab ?c.}", {
      c : {
        type: "literal",
        value: 10
      }
    })
    assert.equal("select * where{?a ?ab 10.}", query)
  });
  it('it should just replace variables' , function () {
    bench = new Bench({})
    query = bench.sparql("select * where{?a ?ab ?c. ab:la <la> <lab>}", {
      a : {
        type: "uri",
        value: "urn:epc:id:gid:0.1.0102030405060708090A0B0C"
      }
    })
    assert.equal("select * where{<urn:epc:id:gid:0.1.0102030405060708090A0B0C> ?ab ?c. ab:la <la> <lab>}", query)
  });
})
