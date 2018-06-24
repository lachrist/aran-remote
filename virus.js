
const Melf = require("melf");
const MelfShare = require("melf-share");
const TrapHints = require("./trap-hints.js");

module.exports = (antena, options, callback) => {
  Melf(antena, options.alias, (error, melf) => {
    if (error)
      return callback(error);
    const share = MelfShare(melf, {synchronous:true});
    melf.rpcall("aran-remote", "aran-remote-initialize", [share.serialize(global), options], (error, data) => {
      if (error)
        return callback(error);
      global[data.namespace] = {SANDBOX:share.instantiate(data.sandbox)};
      Object.keys(TrapHints).forEach((name) => {
        const hints = TrapHints[name];
        const rpname = "aran-remote-"+name;
        switch (hints.length) {
          case 0: global[data.namespace][name] = (                        serial) => share.instantiate(melf.rpcall("aran-remote", rpname, [                                                                                                         serial])); break;
          case 1: global[data.namespace][name] = (value0,                 serial) => share.instantiate(melf.rpcall("aran-remote", rpname, [share.serialize(value0, hints[0]),                                                                       serial])); break;
          case 2: global[data.namespace][name] = (value0, value1,         serial) => share.instantiate(melf.rpcall("aran-remote", rpname, [share.serialize(value0, hints[0]), share.serialize(value1, hints[1]),                                    serial])); break;
          case 3: global[data.namespace][name] = (value0, value1, value2, serial) => share.instantiate(melf.rpcall("aran-remote", rpname, [share.serialize(value0, hints[0]), share.serialize(value1, hints[1]), share.serialize(value2, hints[2]), serial])); break;
          default: throw new Error("Invalid hints length: "+JSON.stringify(hints));
        }
      });
      global.eval(data.setup);
      callback(null, (script, source) => melf.rpcall("aran-remote", "aran-remote-transform", {
        script,
        source,
        scope: typeof source === "number" ? source : (antena.platform === "node" ? "node" : "global")
      }));
    });
  });
};
