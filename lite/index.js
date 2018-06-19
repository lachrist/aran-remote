
const AranRemote = require("../index.js");
const Astring = require("astring");
const Aran = require("aran");

const islower = (string) => string.toLowerCase() === string;

module.exports = (advice, options, callback) => {
  let Advice;
  const aran = Aran();
  options.namespace = aran.namespace;
  options.setup = Astring.generate(aran.setup());
  const initialize = (global, options) => {
    const {advice, parse=Acorn.parse} = Advice(global, options);
    advice.POINTCUT = advice.POINTCUT || Object.keys(advice).filter(islower);
    advice.PARSE = advice.PARSE || Acorn.parse;
    return advice;
  };
  const transform = (script, source, advice) => {
    const estree = advice.PARSE(script);
    return estree ? Astring.generate(aran.weave(estree, advice.POINTCUT, {
      scope: /^https?\:\/\//.test(source) ? "global" : "node",
      sandbox: "SANDBOX" in advice
    })) : script;
  };
  AranRemote(initialize, transform, options, (error, ownerof) => {
    if (error)
      return callback(error);
    Advice = advice({node:aran.node, root:aran.node, ownerof:ownerof});
    callback(null);
  });
};
