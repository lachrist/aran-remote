
const Acorn = require("acorn");
const AranRemote = require("aran-rempte");
const Astring = require("astring");

const aran = await AranRemote(async ({global, alias, argm}) => {
  console.log("Begin: "+alias);
  return {transform, advice};
}, {
  "node-port": 8000,
  "browser-port": 8080
});

const pointcut = (name, node) => name === "eval";

const transform = async (script, source) => {
  const serial = typeof source === "number" ? source : null;
  const estree1 = Acorn.parse(script);
  const estree2 = aran.weave(estree1, pointcut, serial);
  return Astring.generate(estree2);
};

const advice = {eval:transform};
