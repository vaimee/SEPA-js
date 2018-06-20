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
      let search = new RegExp("(\\?|\\$)" + k +"(?=\\s|}|\\?)",'g')
      
      switch (bindings[k].type) {
        case "uri":
          let usingPrefix = new RegExp("^([a-z0-9+.-]+):([a-z0-9+.-]+)")
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
