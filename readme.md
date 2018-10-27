# SEPA-js 🚧🔥
[![Build Status](https://travis-ci.org/arces-wot/SEPA-js.svg?branch=master)](https://travis-ci.org/arces-wot/SEPA-js)
[![SEPA 0.8.4](https://img.shields.io/badge/SEPA-0.8.4-blue.svg)](https://github.com/arces-wot/SEPA/releases/download/0.8.4/engine-0.8.4.jar)
[![npm version](https://badge.fury.io/js/%40arces-wot%2Fsepa-js.svg)](https://badge.fury.io/js/%40arces-wot%2Fsepa-js)
[![Web Version](https://data.jsdelivr.com/v1/package/npm/@arces-wot/sepa-js/badge)](https://www.jsdelivr.com/package/npm/@arces-wot/sepa-js)


A minimal SEPA client for browser and nodejs environments.
**Note** : this library is in an early development stage, use at your own risk.

## Installation

`npm i @arces-wot/sepa-js`

or in your html document

`<script src="https://cdn.jsdelivr.net/npm/@arces-wot/sepa-js@0.1.0/web/sepa.js"/>`

## Usage
Sepa-js comes with basic api to interact with the engine. But it also provides a rich interface to create Dynamic Linked Data applications with the support of **J**SON **S**emantic **A**pplication **P**rofile. ****

### Core api

Nodejs:

```javascript
const sepa = require('@arces-wot/sepa-js').client
```
Browser:
```javascript
const sepa = Sepajs.client
```
##### Subscribe
```javascript
sepa.subscribe("select * where{?sub ?obj ?pred}",{
    next(data) {console.log("Added & removed SPARQL bindings: " + data)},
    error(err) { console.log("Received an error: " + err) },
    complete() { console.log("Server closed connection ") },
  },
  {host:"www.vaimee.com"})
}
```

##### Publish
```javascript
sepa.update("insert {<hello> <from> 'js'}where{}", {host:"www.vaimee.com"})
    .then(()=>{console.log("Updated");})
```

##### Query
```javascript
sepa.query("select * where {?s ?p 'js'}", {host:"www.vaimee.com"})
    .then((data)=>{console.log("SPARQL bindings: " + data);})
```

### JSAP api

Nodejs:

```javascript
const JsapApi = require('sepa-js').Jsap
```
Browser:
```javascript
const JsapApi = Sepajs.Jsap
```

#### JSAP object example:
```json
jsap_example = {
	"host": "mml.arces.unibo.it",
	"oauth": {
		"enable" : false,
		"register": "https://localhost:8443/oauth/register",
		"tokenRequest": "https://localhost:8443/oauth/token"
	},
	"sparql11protocol": {
		"protocol": "http",
		"port": 8000,
		"query": {
			"path": "/query",
			"method": "POST",
			"format": "JSON"
		},
		"update": {
			"path": "/update",
			"method": "POST",
			"format": "JSON"
		}
	},
	"sparql11seprotocol": {
		"protocol": "ws",
		"availableProtocols": {
			"ws": {
				"port": 9000,
				"path": "/subscribe"
			},
			"wss": {
				"port": 9443,
				"path": "/secure/subscribe"
			}
		}
	},
	"namespaces": {
		"exp": "http://www.w3.org/example#",
	},
	"updates": {
		"simpleUpdate": {
			"sparql": "INSERT DATA { exp:hello exp:from 'js' }"
		},
		"updateArgs": {
			"sparql": "INSERT DATA {?sub ?pred ?obj}",
			"forcedBindings": {
				"sub": {
					"type": "uri",
					"value": "exp:hello"
				},
				"pred": {
					"type": "uri",
					"value": "exp:from"
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
					"value": "exp:subj"
				}
			}
		}
	}
}
```
#### Subscriber
```javascript
subscriber = new JsapApi(jsap_example)
subscriber.simpleQuery({},data => {
    console.log("Added & removed SPARQL query bindings: " + data);
})
```
#### Publisher
```javascript
publisher = new JsapApi(jsap_example)
publisher.simpleUpdate().then(res=>{console.log("Update response: " + res)})
```
#### Forced bindings
The JSAP api support query bindings to easly inject data in query templates. Here is an example to use a producer with code specifed bindings:
```javascript
app = new JsapApi(jsap_example)
data = {
  sub : "exp:person1",
  pred: "exp:hasName",
  obj : "Max"
}
app.updateArgs(data).then(res=>{console.log("Update response: " + res)})
```
The SPARQL update issued to the broker will be:
```sparql
PREFIX exp:<http://www.w3.org/example#>
INSERT DATA {exp:person1 exp:hasName 'Max'}
```
**Note** in JSAP you can specify default arguments and their types
