
const Minimist = require("minimist");
const Acorn = require("acorn");
const AranRemote = require("../../lib/main.js");
const Astring = require("astring");
const Linvail = require("linvail");

const advice = {};
const pointcut = (name, node) => name in advice;

const options = Object.assign(Minimist(process.argv.slice(2)), {synchronous:true});

const aran = AranRemote(({global, argm, alias}) => ({advice, transform}), options);

const transform = (script, source) => {
  const serial = typeof source === "number" ? source : null;
  const estree1 = Acorn.parse(script);
  const estree2 = aran.weave(estree1, pointcut, serial);
  return Astring.generate(estree2);
};

let counter = 0;
const membrane = {
  taint: (value) => ({meta:"@"+(++counter), base:value}),
  clean: ($$value) => $$value.base
};
const {capture, release} = Linvail(membrane);
module.exports = (script) => {
  return aran.weave(Acorn.parse(script), pointcut, null);
};

// Consumers //
advice.throw = ($$value, serial) => release(membrane.clean($$value));
advice.test = ($$value, serial) => {
  console.log($$value.meta+" TEST");
  return membrane.clean($$value);
};
advice.success = ($$value, serial) => release(membrane.clean($$value));
advice.eval = ($$value, serial) => {
  const script = release(membrane.clean($$value));
  return transform(script, serial);
};

// Producers //
advice.error = (value, serial) => membrane.taint(capture(value));
advice.primitive = (primitive, serial) => {
  const $$primitive = membrane.taint(primitive);
  console.log($$primitive.meta+" := "+JSON.stringify(primitive));
  return $$primitive;
};
advice.builtin = (value, name, serial) => membrane.taint(capture(value));
advice.closure = ($closure, serial) => {
  Reflect.setPrototypeOf($closure, capture(Function.prototype));
  return membrane.taint($closure);
};
advice.argument = (_value, name) => {
  if (name === "length" || name === "new.target")
    return membrane.taint(_value);
  return _value;
};

// Combiners //
advice.apply = ($$value1, $$value2, $$values, serial) => {
  return Reflect.apply(membrane.clean($$value1), $$value2, $$values);
};
advice.construct = ($$value, $$values, serial) => {
  return Reflect.construct(membrane.clean($$value), $$values);
};
advice.unary = (operator, $$value, serial) => {
  const value = release(membrane.clean($$value));
  const primitive = aran.unary(operator, value);
  const $$primitive = membrane.taint(primitive);
  console.log($$primitive.meta+" := "+operator+" "+$$value.meta);
  return $$primitive;
};
advice.binary = (operator, $$value1, $$value2, serial) => {
  const value1 = release(membrane.clean($$value1));
  const value2 = release(membrane.clean($$value2));
  const primitive = aran.binary(operator, value1, value2);
  const $$primitive = membrane.taint(primitive);
  console.log($$primitive.meta+" := "+$$value1.meta+" "+operator+" "+$$value2.meta);
  return $$primitive;
};