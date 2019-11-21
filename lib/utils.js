const { Url } = require('url');
const util = require('util');
const deepmerge = require('deepmerge')


module.exports.createURI = function (protocol,base,port,path) {
  if (path !== undefined && !path.startsWith("/")) {
    throw "path must starts with /"
  }

  if (protocol === undefined || base === undefined ) {
    throw "prtocol and base must be specified"
  }

  format = ["%s://","%s",":%d","%s"]
  sformat = ""
  farguments = []
  for (i = 0; i < arguments.length; i++) {
        if (arguments[i] !== undefined) {
          sformat += format[i]
          farguments.push(arguments[i])
        }
  }

  url = util.format(sformat,...farguments)
  //check valid uri
  new Url(url)
  return url
};

module.exports.mergeWithDefaults = function (defaults,user) {
  let result

  if (user.options && user.options.httpsAgent) {
    let agent = user.options.httpsAgent
    delete user.options.httpsAgent
    result = deepmerge(defaults, user)
    //ripristinate config
    user.options.httpsAgent = agent
    result.options.httpsAgent = agent

  } else {
    let agent = defaults.options.httpsAgent
    delete defaults.options.httpsAgent
    result = deepmerge(defaults, user)
    defaults.options.httpsAgent = agent
    result.options.httpsAgent = agent
  }

  return result
}
