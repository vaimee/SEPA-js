# SEPA-js 🚧🔥
A minimal SEPA client for browser and nodejs environments.
**Note** : this library is in an early development stage, use at your own risk.

## Installation

`npm i @arces-wot/sepa-js`

or in your html document

`<script src="https://cdn.jsdelivr.net/npm/@arces-wot/sepa-js@0.0.3/web/sepa.js"/>`

## Usage

Nodejs:

```javascript
const sepa = require('sepa-js')
```
Browser:
```javascript
const sepa = Sepajs
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
