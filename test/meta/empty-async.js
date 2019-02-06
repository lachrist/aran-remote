
const Acorn = require("acorn");
const AranRemote = require("../../lib/main.js");
const Astring = require("astring");

let aran; AranRemote(async ({global, alias, argm}) => ({transform, advice}), {
  "node-port": process.argv[2],
  "browser-port": process.argv[3],
  "synchronous": false
}).then((result) => { aran = result }, (error) => { console.log(error) });

const pointcut = (name, node) => name === "eval";

const transform = async (script, source) => {
  const serial = typeof source === "number" ? source : null;
  const estree1 = Acorn.parse(script);
  const estree2 = aran.weave(estree1, pointcut, serial);
  return Astring.generate(estree2);
};

const advice = {eval:transform};
