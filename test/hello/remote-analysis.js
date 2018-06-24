const Acorn = require("acorn");
module.exports = (aran, share) => {
  let counter = 0;
  return (global, options) => ({
    parse: (script, source) => {
      if (source.endsWith("/hello.js")) {
        const estree = Acorn.parse(script, {locations:true});
        estree.source = source;
        return estree;
      }
    },
    advice: {
      ALIAS: options.alias,
      binary: function (operator, left, right, serial) {
        console.log(this.ALIAS+" >> perform #"+(++counter)+": ("+JSON.stringify(left)+operator+JSON.stringify(right)+") at "+aran.root(serial).source+" line: "+aran.node(serial).loc.start.line);
        return eval("left "+operator+" right");
      }
    }
  });
};