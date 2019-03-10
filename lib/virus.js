const Melf = require("melf");
const MelfShare = require("melf-share");
const TrapHints = require("./trap-hints.js");

// Inspired from: https://github.com/iliakan/detect-node
const isnode = () => {
  if (typeof process === "undefined")
    return false
  return Object.prototype.toString.call(process) === "[object process]";
};

const success = () => {
  if (isnode()) {
    process.exit(0);
  } else {
    alert("Success (this page will emit network errors)");
  }
};

const failure = (error) => {
  console.error(error.stack);
  if (isnode()) {
    process.exit(1);
  } else {
    alert("Failure (this page will emit network errors): "+error.message);
  }
};

module.exports = (argm, callback) => {
  Melf(argm.host || argm.splitter, argm.alias, (error, melf) => {
    if (error)
      return failure(error);
    const alias = argm["meta-alias"] || "aran";
    const share = MelfShare(melf, {synchronous:true});
    melf.then(success, failure);
    melf.onterminate = () => {
      melf.rpcall(alias, "onterminate", null);
    };
    melf.rprocedures.terminate = (alias, data, callback) => {
      callback(null, null);
      melf.terminate();
    };
    melf.rprocedures.destroy = (alias, data, callback) => {
      callback(null, null);
      melf.destroy();
    };
    const {namespace, setup} = melf.rpcall(alias, "initialize", {
      global: share.serialize(global),
      argm: argm
    });
    global[namespace] = {__proto__:null};
    Object.keys(TrapHints).forEach((name) => {
      const hints = TrapHints[name];
      global[namespace][name] = (...array) => {
        for (let index = 0, length = array.length - 1; index < length; index++)
          array[index] = share.serialize(array[index], hints[index]);
        return share.instantiate(melf.rpcall(alias, name, array));
      };
    });
    global.eval(setup);
    callback(null, (script, source) => melf.rpcall(alias, "transform", {script, source}));
  });
};
