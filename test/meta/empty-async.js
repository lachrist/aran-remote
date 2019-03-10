
const Minimist = require("minimist");
const Acorn = require("acorn");
const AranRemote = require("../../lib/main.js");
const Astring = require("astring");

const options = Object.assign(Minimist(process.argv.slice(2)), {synchronous:false});

AranRemote(options, (error, aran) => {
  if (error)
    throw error;
  const pointcut = (name, node) => name in advice;
  const transform = (script, source) => {
    const serial = typeof source === "number" ? source : null;
    const estree1 = Acorn.parse(script);
    const estree2 = aran.weave(estree1, pointcut, serial);
    return Astring.generate(estree2);
  };
  aran.then(() => { aran.orchestrator.close() }, (error) => { throw error });
  aran.orchestrator.then(() => { console.log("Success") }, (error) => { throw error });
  aran.onterminate = (alias) => { if (alias !== aran.alias) aran.terminate(aran.alias) };
  const advice = {
    __proto__: null,
    program: async function (serial) { aran.terminate(this.alias) },
    eval: async (script, serial) => transform(await aran.reflect.binary("+", "", script), serial)
  };
  return ({global, alias, argm}) => ({transform, advice: {__proto__:advice, alias}});
});
