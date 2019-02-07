
const Minimist = require("minimist");
const Acorn = require("acorn");
const AranRemote = require("../../lib/main.js");
const Astring = require("astring");

const options = Object.assign(Minimist(process.argv.slice(2)), {synchronous:false});

let aran; AranRemote(async ({global, alias, argm}) => ({transform, advice}), options).then((result) => { aran = result });

const pointcut = (name, node) => name === "eval";

const transform = async (script, source) => {
  const serial = typeof source === "number" ? source : null;
  const estree1 = Acorn.parse(script);
  const estree2 = aran.weave(estree1, pointcut, serial);
  return Astring.generate(estree2);
};

const advice = {eval:transform};
