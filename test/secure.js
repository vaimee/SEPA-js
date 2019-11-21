const secure = require("../lib/secure")
const assert = require("assert")

describe('Secure initizalition unit tests', () => {
    it('should merge configurations', () => {
        const client =  secure.defaultClient("a","b",{host :"another"})
        assert.equal(client.config.host,"another")
    });
    
});