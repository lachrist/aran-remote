
const Acorn = require("acorn");
const AranRemote = require("../../lib/main.js");
const Astring = require("astring");

const aran = AranRemote(({global, alias, argm}) => ({transform, advice}), {
  "node-port": process.argv[2],
  "browser-port": process.argv[3],
  "synchronous": true
});

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
