const secure = require("../lib/secure")
const assert = require("assert")
const axios = require('axios')
describe('Secure initizalition unit tests', () => {
    it('should merge configurations', () => {
        const client =  secure.defaultClient("a","b",{host :"another"})
        assert.equal(client.config.host,"another")
    });
    it('should merge configurations', async () => {
		await axios.get("https://sepa.vaimee.it:8443/echo")
    });
    
});