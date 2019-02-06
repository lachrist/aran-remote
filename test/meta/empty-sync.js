
const Acorn = require("acorn");
const AranRemote = require("../../lib/main.js");
const Astring = require("astring");

const aran = AranRemote(({global, alias, argm}) => ({transform, advice}), {
  "node-port": process.argv[2],
  "browser-port": process.argv[3],
  "synchronous": true
});

const pointcut = (name, node) => name === "eval";

const transform = (script, source) => {
  const serial = typeof source === "number" ? source : null;
  const estree1 = Acorn.parse(script);
  const estree2 = aran.weave(estree1, pointcut, serial);
  return Astring.generate(estree2);
};

const advice = {eval:transform};
