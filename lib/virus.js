const Melf = require("melf");
const MelfShare = require("melf-share");
const TrapHints = require("./trap-hints.js");

module.exports = (argm, callback) => {
  Melf(argm.host || argm.splitter, argm.alias, (error, melf) => {
    if (error)
      return callback(error);
    melf.rprocedures.terminate = (session, message, callback) => {
      callback(null, null);
      melf.terminate((error) => {
        if (error) {
          melf.destroy();
          throw error;
        }
      });
    };
    melf.rprocedures.destroy = (session, message, callback) => {
      callback(null, null);
      melf.destroy();
    };
    const alias = argm["meta-alias"] || "aran";
    const share = MelfShare(melf, {synchronous:true});
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
