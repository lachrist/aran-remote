
const Acorn = require("acorn");
const Astring = require("astring");
const AranRemote = require("aran-remote");

const aran = AranRemote(({global, alias, argm}) => {
  console.log("Initialize "+alias+" "+JSON.stringify(argm));
  return {
    transform: transform,
    advice: {__proto__:advice, _alias:alias}
  };
}, {
  "node-port": 8000,
  "browser-port": 8080
});

const advice = {
  binary: function (operator, left, right, serial) {
    const line = aran.nodes[serial].loc.start.line;
    console.log(this._alias+" >> "+operator+" @"+line);
    return aran.binary(operator, left, right);
  }
};

const pointcut = ["binary"];

const transform = function (script, source) {
  const estree1 = Acorn.parse(script, {locations:true});
  const estree2 = aran.weave(estree1, pointcut, null);
  return Astring.generate(estree2);
};
