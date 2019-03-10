
const Os = require("os");
const Fs = require("fs");
const Path = require("path");
const Aran = require("aran");
const Melf = require("melf");
const MelfShare = require("melf-share");
const Astring = require("astring");
const TrapHints = require("./trap-hints.js");
const Orchestrator = require("./orchestrator");

const identity = (argument) => argument;

const noop = () => {};

module.exports = (options={}, callback) => {
  options = {
    "node-port":     options["node-port"]    || Path.join(Os.tmpdir(), "aran-"+Date.now().toString(36)+"-"+Math.random.toString(36).substring(2)+".sock"),
    "inline":        options["inline"]       || false,
    "alias":         options["alias"]        || "aran",
    "log":           options["log"]          || false,
    "splitter":      options["splitter"]     || "ARAN",
    "melf-share": {
      "synchronous": options["synchronous"]  || false,
    },
    aran: {
      "namespace":   options["namespace"]    || "_",
      "format":      options["format"]       || "estree",
      "root":        options["roots"]        || []
    },
    otiluke: {
      "port":        options["browser-port"] || null,
      "argm-prefix": options["argm-prefix"]  || "ARAN-",
      "ca-home":     options["ca-home"]      || Path.join(__dirname, "..", "ca"),
      "global-var":  options["global-var"]   || "ARAN_TRANSFORM",
      "socket-dir":  options["socket-dir"]   || null
    }
  };
  if (options["melf-share"]["synchronous"] && options["inline"]) {
    return callback(new Error("Cannot use the synchronous API and inline the orchestrator"));
  }
  Orchestrator(options, (error, orchestrator) => {
    if (error) return callback(error);
    Melf(orchestrator.address, options["alias"], (error, melf) => {
      if (error) {
        orchestrator.interrupt();
        callback(error);
      } else {
        const share = MelfShare(melf, options["melf-share"]);
        const analyses = {__proto__:null};
        const generate = options["aran"]["format"] === "estree" ? Astring.generate : identity;
        const aran = Aran(options["aran"]);
        const promise = new Promise((resolve, reject) => { melf.then(resolve, reject) });
        promise.orchestrator = orchestrator;
        promise._aran = aran;
        promise.weave = weave;
        promise.nodes = aran.nodes;
        promise.roots = aran.roots;
        promise.namespace = aran.namespace;
        promise.format = aran.format;
        promise._melf = melf;
        promise.alias = melf.alias;
        promise.onterminate = noop;
        promise.terminate = terminate;
        promise.destroy = destroy;
        promise._share = share;
        promise.ownerof = share.ownerof;
        promise.reflect = share.reflect;
        const Analysis = callback(null, promise);
        melf.rprocedures["onterminate"] = (origin, data, callback) => {
          callback(null, null);
          promise.onterminate(origin);
        };
        melf.onterminate = () => { promise.onterminate(melf.alias) };
        melf.rprocedures["initialize"] = (origin, data, callback) => {
          try {
            analyses[origin] = Analysis({
              alias: origin,
              argm: data.argm,
              global: share.instantiate(data.global)
            });
            callback(null, {
              namespace: aran.namespace,
              setup: generate(aran.setup()),
            });
          } catch (error) {
            callback(error);
          }
        };
        melf.rprocedures["transform"] = (origin, {script, source}, callback) => {
          try {
            callback(null, analyses[origin].transform(script, source));
          } catch (error) {
            callback(error);
          }
        };
        if (options["melf-share"]["synchronous"]) {
          Object.keys(TrapHints).forEach((name) => {
            const hints = TrapHints[name];
            const length = hints.length;
            melf.rprocedures[name] = (origin, data, callback) => {
              try {
                for (let index = 0; index < length; index++)
                  data[index] = share.instantiate(data[index], hints[index]);
                callback(null, share.serialize(analyses[origin].advice[name](...data)));
              } catch (error) {
                callback(error);
              }
            };
          });
        } else {
          Object.keys(TrapHints).forEach((name) => {
            const hints = TrapHints[name];
            const length = hints.length;
            melf.rprocedures[name] = (origin, data, callback) => {
              for (let index = 0; index < length; index++)
                data[index] = share.instantiate(data[index], hints[index]);
              analyses[origin].advice[name](...data).then((result) => {
                callback(null, share.serialize(result), "value");
              }, callback);
            };
          });
        }
      }
    });
  });
};

function weave (root, pointcut, scope) {
  return this._aran.weave(root, pointcut, scope);
}

function terminate (alias, callback) {
  if (alias && alias !== this.alias) {
    this._melf.rpcall(alias, "terminate", null, (error, data) => { if (error) throw error });
  } else {
    this._melf.terminate();
  }
}

function destroy (alias) {
  if (alias && alias !== this.alias) {
    this._melf.rpcall(alias, "destroy", null, (error, data) => { if (error) throw error });
  } else {
    this._melf.destroy();
  }
}
