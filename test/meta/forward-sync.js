
const Minimist = require("minimist");
const Acorn = require("acorn");
const AranRemote = require("../../lib/main.js");
const Astring = require("astring");

const options = Object.assign(Minimist(process.argv.slice(2)), {synchronous:true });

AranRemote(options, (error, aran) => {
  if (error)
    throw error;
  const pointcut = (name, node) => true;
  const transform = (script, source) => {
    const serial = typeof source === "number" ? source : null;
    const estree1 = Acorn.parse(script);
    const estree2 = aran.weave(estree1, pointcut, serial);
    return Astring.generate(estree2);
  };
  const noop =       () => {};
  const identity =       (arg0) => arg0;
  const advice = {__proto__:null};
  // Informers //
  [
    "program",
    "arrival",
    "enter",
    "leave",
    "continue",
    "break",
    "debugger"
  ].forEach((key) => { advice[key] = noop });
  // Transformers //
  [
    "error",
    "abrupt",
    "throw",
    "return",
    "closure",
    "builtin",
    "primitive",
    "read",
    "argument",
    "drop",
    "test",
    "write",
    "success",
    "failure"
  ].forEach((key) => { advice[key] = identity });
  advice.eval =       (script, serial) => transform(      aran.reflect.binary("+", "", script), serial);
  // Combiners //                       
  advice.construct =       (c, xs, s) =>       aran.reflect.construct(c, xs);
  advice.apply =       (f, t, xs, s) =>       aran.reflect.apply(f, t, xs);
  advice.unary =       (o, x) =>       aran.reflect.unary(o, x);
  advice.binary =       (o, x1, x2) =>       aran.reflect.binary(o, x1, x2);
  return ({global, alias, argm}) => ({transform, advice});
});

