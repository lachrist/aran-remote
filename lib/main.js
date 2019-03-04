
const Fs = require("fs");
const Path = require("path");
const Os = require("os");
const ChildProcess = require("child_process");
const Aran = require("aran");
const Melf = require("melf");
const MelfShare = require("melf-share");
const Astring = require("astring");
const TrapHints = require("./trap-hints.js");

const identity = (argument) => argument;

module.exports = (options={}, callback) => {
  options = {
    "port":                    "node-port"    in options ? options["node-port"]    : Path.join(Os.platform() === "win32" ? "\\\\?\\pipe" : Os.tmpdir(), Date.now().toString(36)+"-"+Math.random().toString(36).substring(2)),
    "aran-namespace":          "namespace"    in options ? options["namespace"]    : "ARAN",
    "aran-format":             "format"       in options ? options["format"]       : "estree",
    "aran-roots":              "roots"        in options ? options["roots"]        : [],
    "melf-alias":              "alias"        in options ? options["alias"]        : "aran",
    "melf-log":                "log"          in options ? options["log"]          : false,
    "melf-share-synchronous":  "synchronous"  in options ? options["synchronous"]  : false,
    "otiluke-port":            "browser-port" in options ? options["browser-port"] : null,
    "otiluke-argm-prefix":     "argm-prefix"  in options ? options["argm-prefix"]  : "ARAN-",
    "otiluke-splitter":        "splitter"     in options ? options["splitter"]     : "ARAN",
    "otiluke-ca-home":         "ca-home"      in options ? options["ca-home"]      : Path.join(__dirname, "..", "ca"),
    "otiluke-global-var":      "global-var"   in options ? options["global-var"]   : "ARAN_TRANSFORM",
    "otiluke-socket-dir":      "socket-dir"   in options ? options["socket-dir"]   : null
  };
  const analyses = {__proto__:null};
  const generate = options["aran-format"] === "estree" ? Astring.generate : identity;
  const aran = Aran({
    namespace: options["aran-namespace"],
    format: options["aran-format"],
    roots: options["aran-roots"]
  });
  const common = (melf, share, options) => {
    const Analysis = callback(null, Object.assign({
      __proto__: aran,
      _melf: melf,
      reflect: share.reflect,
      ownerof: share.ownerof,
      terminate,
      destroy,
      setup
    }, options));
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
  }
  if (options["melf-share-synchronous"]) {
    const child = ChildProcess.fork(Path.join(__dirname, "orchestrator-bin.js"), [JSON.stringify(options)]); //  , {execArgv:['--inspect-brk=9230']}
    let error1 = null;
    child.once("error", (error) => {
      error1 = error;
    });
    child.once("exit", (code, signal) => {
      error1 = new Error("Orchestrator process exit with: code = "+code+", signal = "+signal);
    });
    child.once("message", () => {
      if (error1)
        return callback(error1);
      Melf(options["port"], options["melf-alias"], (error2, melf) => {
        if (error1 || error2)
          return callback(error1 || error2);
        child.removeAllListeners("error");
        child.removeAllListeners("exit");
        const share = MelfShare(melf, {synchronous:true});
        common(melf, share, callback(null, {child}));
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
      });
    });
  } else {
    require("./orchestrator.js")(options, (error, receptor, server, proxy) => {
      if (error)
        return callback(error);
      Melf(receptor, options["melf-alias"], (error, melf) => {
        if (error)
          return callback(error);
        const share = MelfShare(melf, {synchronous:false});
        common(melf, share, callback(null, {server, proxy}));
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
      });
    });
  };
};

const setup = () => {
  throw new Error("Setup should not be called outside aran-remote");
};

function terminate (session, callback) {
  if (session) {
    this._melf.rpcall(session, "terminate", null, callback);
  } else {
    this._melf.terminate(callback);
  }
};

function destroy (session) {
  if (session) {
    this._melf.rpcall(session, "destroy", null, (error, result) => {});
  } else {
    this._melf.destroy();
  }
};
