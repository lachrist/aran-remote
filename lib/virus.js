const Melf = require("melf");
const MelfShare = require("melf-share");
const TrapHints = require("./trap-hints.js");

module.exports = (argm) => {
  const melf = Melf(argm.host || argm.splitter, argm.alias);
  const alias = argm["meta-alias"] || "aran";
  const share = MelfShare(melf, {synchronous:true});
  const {namespace, setup} = melf.rpcall(alias, "initialize", {
    global: share.serialize(global),
    argm: argm
  });
  global[namespace] = {__proto__:null};
  Object.keys(TrapHints).forEach((name) => {
    const hints = TrapHints[name];
    switch (hints.length) {
      case 0: global[namespace][name] = (                                serial) => share.instantiate(melf.rpcall(alias, name, [                                                                                                                                            serial])); break;
      case 1: global[namespace][name] = (value0,                         serial) => share.instantiate(melf.rpcall(alias, name, [share.serialize(value0, hints[0]),                                                                                                          serial])); break;
      case 2: global[namespace][name] = (value0, value1,                 serial) => share.instantiate(melf.rpcall(alias, name, [share.serialize(value0, hints[0]), share.serialize(value1, hints[1]),                                                                       serial])); break;
      case 3: global[namespace][name] = (value0, value1, value2,         serial) => share.instantiate(melf.rpcall(alias, name, [share.serialize(value0, hints[0]), share.serialize(value1, hints[1]), share.serialize(value2, hints[2]),                                    serial])); break;
      case 4: global[namespace][name] = (value0, value1, value2, value3, serial) => share.instantiate(melf.rpcall(alias, name, [share.serialize(value0, hints[0]), share.serialize(value1, hints[1]), share.serialize(value2, hints[2]), share.serialize(value3, hints[3]), serial])); break;
      default: throw new Error("Invalid hints length: "+JSON.stringify(hints));
    }
  });
  global.eval(setup);
  return (script, source) => melf.rpcall(alias, "transform", {script, source});
};
