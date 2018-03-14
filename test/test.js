const assert = require('assert');
const utils = require('../lib/utils');

describe('utils', function() {
    it('test uri function regular', function() {
      assert.equal("http://localhost:8888/path", utils.createURI("http","localhost",8888,"/path"))
    });

    it('test uri function regular wrong path', function() {
      assert.throws(() => {
        utils.createURI("http","localhost",8888,"hello")
      })
    });

    it('test uri function regular missing path', function() {
      assert.equal("http://localhost:8888", utils.createURI("http","localhost",8888))
    });

    it('test uri function regular missing port', function() {
      assert.equal("http://localhost", utils.createURI("http","localhost"))
    });

    it('test uri function regular missing port with path', function() {
      assert.equal("http://localhost/path", utils.createURI("http","localhost",undefined,"/path"))
    });


    it('test uri function regular wrong uri', function() {
      assert.throws(() => {
        utils.createURI("http","loca@l?hos/t",8888,"hello")
      })
    });
});
