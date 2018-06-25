
const Path = require("path");
const Astring = require("astring");
const ChildProcess = require("child_process");
const Aran = require("aran");
const Antena = require("antena/node");
const Melf = require("melf");
const MelfShare = require("melf-share");
const TrapHints = require("./trap-hints.js");

const identity = (argument) => argument;
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
      const make_remote = remote_analysis({aran, share});
      melf.rprocedures["aran-remote-initialize"] = (origin, {global, argm, platform}, callback) => {
        const transform = (script, source) => {
          const estree = remote.parse(script, source);
          return estree ? Astring.generate(aran.weave(estree, remote.pointcut, {
            scope: (
              typeof source === "number" ?
              source :
              (
                typeof source === "string" && platform === "node" ?
                ["this", "__dirname", "__filename", "require", "module", "exports"] :
                ["this"])),
            sandbox: "SANDBOX" in remote.advice
          })) : script;
        };
        const remote = make_remote({global:share.instantiate(global), argm, transform});
        remote.pointcut = remote.pointcut || Object.keys(remote.advice).filter(islower);
        remote.transform = transform;
        remotes[origin] = remote;
        callback(null, {
          namespace: aran.namespace,
          setup: Astring.generate(aran.setup()),
          sandbox: share.serialize(remote.advice.SANDBOX)
        });
      };
      melf.rprocedures["aran-remote-transform"] = (origin, {script, source}, callback) => {
        try {
          callback(null, remotes[origin].transform(script, source));
        } catch (error) {
          callback(error);
        }
      };
      Object.keys(TrapHints).forEach((name) => {
        const hints = TrapHints[name];
        const hint = name === "begin" || name === "arrival" ? {} : "*";
        switch (hints.length) {
          case 0: melf.rprocedures["aran-remote-"+name] = (origin, data, callback) => { try { callback(null, share.serialize(remotes[origin].advice[name](                                                                                    data[0]), hint)) } catch (error) { callback(error) } }; break;
          case 1: melf.rprocedures["aran-remote-"+name] = (origin, data, callback) => { try { callback(null, share.serialize(remotes[origin].advice[name](share.instantiate(data[0]),                                                         data[1]), hint)) } catch (error) { callback(error) } }; break;
          case 2: melf.rprocedures["aran-remote-"+name] = (origin, data, callback) => { try { callback(null, share.serialize(remotes[origin].advice[name](share.instantiate(data[0]), share.instantiate(data[1]),                             data[2]), hint)) } catch (error) { callback(error) } }; break;
          case 3: melf.rprocedures["aran-remote-"+name] = (origin, data, callback) => { try { callback(null, share.serialize(remotes[origin].advice[name](share.instantiate(data[0]), share.instantiate(data[1]), share.instantiate(data[2]), data[3]), hint)) } catch (error) { callback(error) } }; break;
          default: throw new Error("Invalid hints length: "+JSON.stringify(hints));
        }
      });
      callback(null, child);
    });
  });
};
