
const Path = require("path");
const Astring = require("astring");
const ChildProcess = require("child_process");
const Aran = require("aran");
const Antena = require("antena/node");
const Melf = require("melf");
const MelfShare = require("melf-share");
const TrapHints = require("./trap-hints.js");

const islower = (string) => string.toLowerCase() === string;

module.exports = (remote_analysis, options, callback) => {
  const child = ChildProcess.fork(Path.join(__dirname, "child-melf-server.js"), [JSON.stringify(options)]);
  child.on("message", () => {
    Melf(new Antena(options["node-port"]||options["port"]), "aran-remote", (error, melf) => {
      if (error)
        return callback(error);
      const share = MelfShare(melf, {synchronous:true});
      const aran = Aran();
      const remotes = {};
      const make_remote = remote_analysis(aran, share);
      melf.rprocedures["aran-remote-initialize"] = (origin, {global, options}, callback) => {
        remotes[origin] = make_remote(share.instantiate(global), options);
        remotes[origin].pointcut = remotes[origin].pointcut || Object.keys(remotes[origin].advice).filter(islower);
        callback(null, {
          namespace: aran.namespace,
          setup: Astring.generate(aran.setup()),
          sandbox: share.serialize(remotes[origin].advice.SANDBOX)
        });
      };
      melf.rprocedures["aran-remote-transform"] = (origin, {script, source, scope}, callback) => {
        const estree = remotes[origin].parse(script, source);
        if (estree) {
          callback(null, Astring.generate(aran.weave(estree, remotes[origin].pointcut, {
            scope: scope,
            sandbox: Boolean("SANDBOX" in remotes[origin].advice)
          })));
        } else {
          callback(null, script);
        }
      };
      Object.keys(TrapHints).forEach((name) => {
        const hint = name === "begin" || name === "arrival" ? {} : "*";
        melf.rprocedures["aran-remote-"+name] = (origin, data, callback) => {
          try {
            callback(null, share.serialize(remotes[origin].advice[name](...data.map(share.instantiate)), hint));
          } catch (error) {
            callback(error);
          }
        };
      });
      callback(null, child);
    });
  });
};
