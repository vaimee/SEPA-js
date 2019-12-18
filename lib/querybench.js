class SPARQLbench {

  constructor(namespaces = {}){
    this.namespaces = namespaces
  }

  addNameSpace(prefix,ns){
    this.namespaces[prefix] = ns
  }

  removeNameSpace(prefix){
    this.namespaces.delete(prefix)
  }

  sparql(template,bindings){
    let prefixes = []
    Object.keys (this.namespaces). forEach (k => {
      let pref = `PREFIX ${k}:<${this.namespaces[k]}>`
      prefixes.push(pref)
    });
    prefixes = prefixes.join(" ")
    Object.keys(bindings).forEach(k =>{
      let search = new RegExp("(\\?|\\$)" + k +"(?![a-z]|[A-Z]|_|[0-9]|[\\u00D6-\\u06fa]|[\\u00D8-\\u00F6]|[\\u00F8-\\u02FF]|[\\u0370-\\u037D]|[\\u037F-\\u1FFF]|[\\u200C-\\u200D]|[\\u2070-\\u218F]|[\\u2C00-\\u2FEF]|[\\u3001-\\uD7FF]|[\\uF900-\\uFDCF]|[\\uFDF0-\\uFFFD]|[\\u1000-\\uEFFF])",'g')
      switch (bindings[k].type) {
        case "uri":
          const usingPrefix = /^([A-Z]|[a-z])(([A-Z]|[a-z]|_|-|[0-9]|\.)*([A-Z]|[a-z]|_|-|[0-9]))?:([A-Z]|[a-z]|_|[0-9])(([A-Z]|[a-z]|_|-|[0-9]|\.)*([A-Z]|[a-z]|_|-|[0-9]))?$/gm;
          let replaceValue = usingPrefix.test(bindings[k].value) ? bindings[k].value : "<" + bindings[k].value + ">"
          template = template.replace(search,replaceValue)
          break;
        case "literal":
          if (typeof bindings[k].value === "string") {
            template = template.replace(search,"'"+bindings[k].value+"'")
          }else{
            template = template.replace(search,bindings[k].value)
          }
          break;
        default:
          template = template.replace(search,bindings[k].value)
      }
    })
    return (prefixes+" "+template).trim()
  }
}

module.exports = SPARQLbench;
