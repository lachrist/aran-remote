
const Minimist = require("minimist");
const Acorn = require("acorn");
const AranRemote = require("../../lib/main.js");
const Astring = require("astring");
const Linvail = require("linvail");

const options = Object.assign(Minimist(process.argv.slice(2)), {
  inline: false,
  synchronous: true,
});

AranRemote(options, (error, aran) => {
  if (error)
    throw error;
  const advice = {};
  const pointcut = (name, node) => name in advice;
  const transform = (script, source) => {
    const serial = typeof source === "number" ? source : null;
    const estree1 = Acorn.parse(script);
    const estree2 = aran.weave(estree1, pointcut, serial);
    return Astring.generate(estree2);
  };
  let time = null;
  aran.then(() => { aran.orchestrator.terminate() }, (error) => { throw error });
  aran.orchestrator.then(() => { console.log("Success "+process.hrtime(time)) }, (error) => { throw error });
  aran.onterminate = (alias) => { if (alias !== aran.alias) aran.terminate(aran.alias) };
  let counter = 0;
  const membrane = {
    taint: (value) => ({meta:"@"+(++counter), base:value}),
    clean: ($$value) => $$value.base
  };
  const {capture, release} = Linvail(membrane);
  // Informers //
  advice.program = function (serial) {
    time = process.hrtime();
    aran.terminate(this.alias);
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
    const primitive = aran.reflect.unary(operator, value);
    const $$primitive = membrane.taint(primitive);
    console.log($$primitive.meta+" := "+operator+" "+$$value.meta);
    return $$primitive;
  };
  advice.binary = (operator, $$value1, $$value2, serial) => {
    const value1 = release(membrane.clean($$value1));
    const value2 = release(membrane.clean($$value2));
    const primitive = aran.reflect.binary(operator, value1, value2);
    const $$primitive = membrane.taint(primitive);
    console.log($$primitive.meta+" := "+$$value1.meta+" "+operator+" "+$$value2.meta);
    return $$primitive;
  };
  // Return
  return ({global, alias, argm}) => ({transform, advice:{__proto__:advice, alias}});
});
