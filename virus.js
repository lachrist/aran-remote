
const Melf = require("melf");
const MelfShare = require("melf-share");
const TrapHints = require("./trap-hints.js");

module.exports = (antena, options, callback) => {
  Melf(antena, options.alias, (error, melf) => {
    if (error)
      return callback(error);
    const share = MelfShare(melf, {synchronous:true});
    melf.rpcall("aran-remote", "aran-remote-initialize", {global:share.serialize(global), options}, (error, data) => {
      if (error)
        return callback(error);
      const transform = (script, source) => melf.rpcall("aran-remote", "aran-remote-transform", {
        script,
        source,
        scope: typeof source === "number" ? source : (antena.platform === "node" ? "node" : "global")
      });
      global[data.namespace] = {
        SANDBOX:share.instantiate(data.sandbox),
        eval: transform
      };
      Object.keys(TrapHints).forEach((name) => {
        const hints = TrapHints[name];
        global[data.namespace][name] = function () {
          const array = new Array(arguments.length);
          for (let index = 0, length = arguments.length; index<length; index++)
            array[index] = share.serialize(arguments[index], hints[index]);
          return share.instantiate(melf.rpcall("aran-remote", "aran-remote-"+name, array));
        };
      });
      global.eval(data.setup);
      callback(null, transform);
    });
  });
};
