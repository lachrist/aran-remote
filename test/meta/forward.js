
const Acorn = require("acorn");
const AranRemote = require("aran-rempte");
const Astring = require("astring");

const aran = AranRemote(({global, alias, argm}) => {
  console.log("Begin: "+alias);
  return {transform, advice};
}, {
  "node-port": 8000,
  "browser-port": 8080
});

const pointcut = (name, node) => name === "eval";

const transform = (script, source) => {
  const serial = typeof source === "number" ? source : null;
  const estree1 = Acorn.parse(script1);
  const estree2 = aran.weave(estree1, pointcut, serial);
  return Astring.generate(estree2);
};

const advice = {};





module.exports = ({aran, share}) => ({global, argm, transform}) => {

  const ADVICE = {};

  const pass = function () { return arguments[arguments.length-2] };
  [
    "array",
    "arrival",
    "read",
    "load",
    "save",
    "catch",
    "object",
    "primitive",
    "regexp",
    "closure",
    "discard",
    "completion",
    "success",
    "failure",
    "test",
    "throw",
    "return",
    "eval",
    "begin",
    "with",
    "write",
    "declare",
  ].forEach((name) => { ADVICE[name] = pass });

  ///////////////
  // Informers //
  ///////////////
  const noop = () => {};
  [
    "copy",
    "swap",
    "drop",
    "try",
    "finally",
    "leave",
    "end",
    "block",
    "label",
    "break"
  ].forEach((name) => { ADVICE[name] = noop });

  ///////////////
  // Computers //
  ///////////////
  ADVICE.apply = (callee, values, serial) => callee(...values);
  ADVICE.construct = (callee, values, serial) => new callee(...values);
  ADVICE.invoke = (object, key, values, serial) => Reflect.apply(object[key], object, values);
  ADVICE.unary = (operator, argument, serial) => eval(operator+" argument");
  ADVICE.binary = (operator, left, right, serial) => eval("left "+operator+" right");
  ADVICE.get = (object, key, serial) => object[key];
  ADVICE.set = (object, key, value, serial) => object[key] = value;
  ADVICE.delete = (object, key, serial) => delete object[key];

  //////////////////////////////
  // Tracer (uncomment below) //
  //////////////////////////////
  const print = (value) => {
    if (typeof value === "function")
      return "function";
    if (typeof value === "object")
      return value ? "object" : "null";
    if (typeof value === "string")
      return JSON.stringify(value);
    return String(value);
  };
  Object.keys(ADVICE).forEach((name) => {
    const trap = ADVICE[name];
    ADVICE[name] = function () {
      console.log(name+" "+Array.from(arguments).map(print).join(" "));
      return Reflect.apply(trap, this, arguments);
    };
  });

  ///////////
  // Setup //
  ///////////

  return {
    parse: (script, source) => Acorn.parse(script),
    advice: ADVICE
  };

};
