
const Melf = require("melf");
const MelfShare = require("melf-share");
const TrapTypes = require("./trap-types.js");

module.exports = (antena, options, callback) => {
  Melf(antena, options.alias, (error, melf) => {
    if (error)
      return callback(error);
    const share = MelfShare(melf, {sync:true});
    melf.rpcall("aran-remote", "aran-remote-initialize", [share.serialize(global), options], (error, data) => {
      if (error)
        return callback(error);
      global[data.namespace] = {SANDBOX:share.instantiate(data.sandbox)};
      Object.keys(TrapTypes).forEach((name) => {
        global[data.namespace][name] = function () {
          return share.instantiate(melf.rpcall("aran-remote", "aran-remote-"+name, share.serialize(arguments, TrapTypes[name])));
        };
      });
      global.eval(data.setup);
      callback(null, (script, source) => melf.rpcall("aran-remote", "aran-remote-transform", [script, source]));
    });
  });
};
