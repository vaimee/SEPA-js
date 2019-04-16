const assert = require('assert');
const register = require('../../lib/secure').register



describe('Core secure APIs integration tests', () => {
   let client
   
    before(() => {
        return register("SEPATest").then((secureCli) => {
            client = secureCli
        })
    });
    
    it('Should query', () => {
        return client.query("select * where{?a ?b ?c}")
    });

    it('Should update', () => {
        return client.update("INSERT DATA {<hello> <test> <test>}")
    });

    it('Should subscribe', (done) => {
        let sub = client.subscribe("select * where{?a ?b ?c}")

        sub.on("subscribed", () => { sub.kill(); done() })
        sub.on("error", done)
        sub.on("connection-error", done)
    });
    
    it('Should subscribe and unsubscribe', (done) => {
        let sub = client.subscribe("select * where{?a ?b ?c}")
        sub.on("subscribed", () => { sub.unsubscribe() })
        sub.on("error", done)
        sub.on("connection-error", done)
        sub.on("unsubscribed", () => done())
    });

    it('Subscribe should renew the webtoken', (done) => {
        let sub = client.subscribe("select * where{?a ?b ?c}")
        
        sub.on("subscribed", () => {
            sub.unsubscribe()
        })
        sub.on("unsubscribed", () => {
            new Promise((resolve, reject) => {
                setTimeout(resolve, 5100)
            }).then(async () => {
                let sub2 = await client.subscribe("select * where{?a ?b ?c}")
                sub2.on("subscribed", () => { done(); sub2.kill() })
                sub2.on("error", done)
                sub2.on("connection-error", done)
            })
        })
       
    });

    
    it('Unsubscribe should renew the webtoken', (done) => {
        let sub = client.subscribe("select * where{?a ?b ?c}")
        sub.on("subscribed", () => {
            new Promise((resolve) => {
                setTimeout(resolve, 5100)
            }).then(sub.unsubscribe.bind(sub))
        })

        sub.on("unsubscribed", () => { done() })
        sub.on("error", done)
        sub.on("connection-error", done)    
    })

    it('Query should renew token', () => {
            return client.query("select * where{?a ?b ?c}").then(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(resolve, 5100)
                }).then(() => {
                    return client.query("select * where{?a ?b ?c}").then((resp) => {
                        assert.ok(resp,"Token seems renewed but the response is undefined")
                    }).catch((erro) => {
                        assert.fail("Token is not renewed")
                    })
                })
        })
    });

    it('Update should renew token', () => {
        return client.update("INSERT DATA {<hello> <test> <test>}").then(() => {
            return new Promise((resolve, reject) => {
                setTimeout(resolve, 5100)
            }).then(() => {
                return client.update("INSERT DATA {<hello> <test> <test>}").then((resp) => {
                    assert.ok(resp, "Token seems renewed but the response is undefined")
                }).catch((erro) => {
                    assert.fail("Token is not renewed")
                })
            })
        })
    });

});