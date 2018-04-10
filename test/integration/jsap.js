const assert = require('assert');
const Jsap = require('../../lib/jsap')
const test_jsap = require("../jsapconfig")

describe('Integration tests for jsap api', function() {
    let jsap
    beforeEach(function() {
      jsap = new Jsap(test_jsap)
    });

    it('test producer', function() {
       return jsap.Producers.simple().then((res)=>{
         assert.equal(200,res.status)
       }).catch((err)=> {
         console.log(err);
         assert.ok(false,"Update not confirmed: "+err)
       })
    });

    it('test producer with bindings dafaults', function() {
       return jsap.Producers.defaultArgs().then((res)=>{
         assert.equal(200,res.status)
       }).catch((err)=> {
         console.log(err);
         assert.ok(false,"Update not confirmed: "+err)
       })
    });

    it('test producer with bindings override', function() {
       return jsap.Producers.defaultArgs({obj : 'jsap'}).then((res)=>{
         assert.equal(200,res.status)
       }).catch((err)=> {
         console.log(err);
         assert.ok(false,"Update not confirmed: "+err)
       })
    });

    it('test consumer', function(done) {
       let res = jsap.Consumers.simple({},data => {
         assert.ok(data.subscribed)
         res.unsubscribe()
         done()
       })
    });

    it('test consumer with bindings default', function(done) {
       let res = jsap.Consumers.defaultArgs({},data => {
         assert.ok(data.subscribed)
         res.unsubscribe()
         done()
       })
    });

    it('test consumer with bindings override', function(done) {
       let res = jsap.Consumers.defaultArgs({a:"jsap"},data => {
         assert.ok(data.subscribed)
         res.unsubscribe()
         done()
       })
    });

    it('test consumer - producer notifcation', function(done) {
       jsap.deleteIntgration().then(res =>{
         assert.equal(200,res.status)
         let sub = jsap.integration({},data =>{
           if(data.subscribed){
             jsap.notification().then(res =>{
               assert.equal(200,res.status)
             })
           }
           // skip the confirmation message
           if(data.results){
             assert.equal(data.results.addedresults.bindings[0].c.value,"Hello World")
             sub.unsubscribe()
             done()
           }
         })

       })
    });
})
