const assert = require('assert');
const sepa = require('../../lib/core').client
var config_host = "localhost"

describe('Integration tests for api', function() {
    it('test subscription', function(done) {
       let sub = sepa.subscribe("select ?a where {<integration> <tests> ?a}",data => {
          sub.unsubscribe()
          assert.ok(data.subscribed)
          done()
       },
       {host:config_host})
    });
    it('test subscription should give error', function(done) {
      this.timeout(15000);
       let sub = sepa.subscribe("selectfd ?a where {<integration> <tests> ?a}",{
         next(val) {
          },
         error(err)  {
           sub.unsubscribe();
           done()
         }
       },
       {host:config_host})
    });
    it('test notification with update', function(done) {
      sepa.update("delete{<integration> <tests> ?a}where{<integration> <tests> ?a}",
        {host:config_host}).then(
        (res)=>{
          assert.equal(200,res.status)
          let sub = sepa.subscribe("select ?a where {<integration> <tests> ?a}",data => {
             if(data.subscribed){
              sepa.update("insert{<integration> <tests> '--hello--'}WHERE{}",
              {host:config_host}).then(
                  (res)=>{
                    assert.equal(200,res.status)
                  }
                )
             }else if (data.results){
              assert.equal(data.results.addedresults.bindings[0].a.value,"--hello--")
                sub.unsubscribe()
                done()
             }
          },
          {host:config_host})
        }
      )
    });

})
