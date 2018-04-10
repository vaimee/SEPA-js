const assert = require('assert');
const sepa = require('../../lib/core').client
var config_host = "localhost"

describe('Integration tests for api', function() {
    it('test subscription', function(done) {
       let sub = sepa.subscribe("select ?a where {<integration> <tests> ?a}",data => {
          sub.unsubscribe()
          assert.ok(data.notification)
          assert.equal(data.notification.sequence,0)
          done()
       },
       {host:config_host})
    });
    it('test subscription should give error', function(done) {
       let sub = sepa.subscribe("selectfa ?a where {<integration> <tests> ?a}",{
         next(val) {
           sub.unsubscribe();
           assert.ok(false,"This subscription should fail!")},
         error(err)  {
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
             if(data.notification && data.notification.sequence == 0){
              sepa.update("insert{<integration> <tests> '--hello--'}",
              {host:config_host}).then(
                  (res)=>{
                    assert.equal(200,res.status)
                  }
                )
             }else if (data.notification && data.notification.sequence > 0){
              assert.equal(data.notification.addedResults.results.bindings[0].a.value,"--hello--")
                sub.unsubscribe()
                done()
             }
          },
          {host:config_host})
        }
      )
    });

})
