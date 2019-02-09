
const Minimist = require("minimist");
const Acorn = require("acorn");
const AranRemote = require("../../lib/main.js");
const Astring = require("astring");

const options = Object.assign(Minimist(process.argv.slice(2)), {synchronous:true});

const aran = AranRemote(({global, alias, argm}) => ({transform, advice}), options);
process.on("SIGINT", () => { aran.child.kill("SIGINT") });
process.on("SIGTERM", () => { aran.child.kill("SIGTERM") });

const pointcut = (name, node) => true;

const transform = (script, source) => {
  const serial = typeof source === "number" ? source : null;
  const estree1 = Acorn.parse(script);
  const estree2 = aran.weave(estree1, pointcut, serial);
  return Astring.generate(estree2);
};

const noop = () => {};
const identity = (arg0) => arg0;
const advice = {};

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
advice.eval = transform;

// Combiners //
advice.construct = (c, xs, s) => aran.construct(c, xs);
advice.apply = (f, t, xs, s) => aran.apply(f, t, xs);
advice.unary = (o, x) => aran.unary(o, x);
advice.binary = (o, x1, x2) => aran.binary(o, x1, x2);
