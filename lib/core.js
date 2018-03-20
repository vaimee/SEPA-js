const defaults = require('./defaults');
const SEPA = require('./sepa');
const jsap = require('./jsap');

module.exports = {
  client : new SEPA(defaults),
  Jsap : jsap
}
