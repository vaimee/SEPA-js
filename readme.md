# SEPA-js 🚧🔥
[![Build Status](https://travis-ci.org/arces-wot/SEPA-js.svg?branch=master)](https://travis-ci.org/arces-wot/SEPA-js)
[![SEPA 0.8.4](https://img.shields.io/badge/SEPA-0.8.4-blue.svg)](https://github.com/arces-wot/SEPA/releases/download/0.8.4/engine-0.8.4.jar)
[![npm version](https://badge.fury.io/js/%40arces-wot%2Fsepa-js.svg)](https://badge.fury.io/js/%40arces-wot%2Fsepa-js)


A minimal SEPA client for browser and nodejs environments.
**Note** : this library is in an early development stage, use at your own risk.

## Installation

`npm i @arces-wot/sepa-js`

or in your html document

`<script src="https://cdn.jsdelivr.net/npm/@arces-wot/sepa-js@0.1.0/web/sepa.js"/>`

## Usage
Sepa-js comes with basic api to interact with the engine. But it also provides a rich interface to create Semantic Applications with the support of **J**SON **S**emantic **A**pplication **P**rofile. ****

### Core api

Nodejs:

```javascript
const sepa = require('sepa-js').client
```
Browser:
```javascript
const sepa = Sepajs.client
```

```javascript
sepa.subscribe("select * where{?sub ?obj ?pred}",{
    next(val) {console.log("Data received: " + data)},
    error(err) { console.log("Received an error: " + err) },
    complete() { console.log("Server closed connection ") },
  },
  {host:"www.vaimee.com"})
}
```

```javascript
sepa.update("insert {<hello> <from> 'js'}where{}", {host:"www.vaimee.com"})
    .then(()=>{console.log("Updated");})
```

### JSAP api

Nodejs:

```javascript
const Jsap = require('sepa-js').jsap
```
Browser:
```javascript
const Jsap = Sepajs.jsap
```
Given this jsap file as example:
```json
{
	"parameters": {
		"host": "mml.arces.unibo.it",
		"ports": {
			"http": 8000,
			"https": 8443,
			"ws": 9000,
			"wss": 9443
		},
		"paths": {
			"query": "/query",
			"update": "/update",
			"subscribe": "/subscribe",
			"register": "/oauth/register",
			"tokenRequest": "/oauth/token",
			"securePath": "/secure"
		}
	},
	"namespaces": {
		"exp": "http://www.w3.org/example#",
	},
	"updates": {
		"simpleUpdate": {
			"sparql": "INSERT { <hello> <from> <js> }WHERE{}"
		},
		"updateArgs": {
			"sparql": "INSERT {?sub ?pred ?obj}WHERE{}",
			"forcedBindings": {
				"sub": {
					"type": "uri",
					"value": "hello"
				},
				"pred": {
					"type": "uri",
					"value": "from"
				},
				"obj": {
					"type": "literal",
					"value": "js"
				}
			}
		}
	},
	"queries": {
		"simpleQuery": {
			"sparql": "select * where{?a ?b ?c}"
		},
		"queryArgs": {
			"sparql": "select * where{?a ?b ?c}",
			"forcedBindings": {
				"a": {
					"type": "uri",
					"value": "subj"
				}
			}
		}
	}
}
```
To create a consumer you can:
```javascript
app = new Jsap(Jsap)
app.simpleQuery({},data => {
    console.log(data);
})
```
Otherwise a producer can be created with this code snippet:
```javascript
app = new Jsap(Jsap)
app.simpleUpdate().then(res=>{console.log(res)})
```

The JSAP api support query bindings to easly inject data in query templates. Here is an example to use a producer with code specifed bindings:
```javascript
app = new Jsap(Jsap)
data = {
  sub : "person1",
  pred: "hasName",
  obj : "Max"
}
app.updateArgs(data).then(res=>{console.log(res)})
```
The query issued to the engine will be:
```sparql
PREFIX exp:<http://www.w3.org/example#>
INSERT {<person1> <hasName> 'Max'}WHERE{}
```
**Note** in JSAP you can specify default arguments and their types
