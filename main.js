
const Fs = require("fs");
const Path = require("path");
const Os = require("os");
const ChildProcess = require("child_process");
const Aran = require("aran");
const Melf = require("melf");
const MelfShare = require("melf-share");
const Astring = require("astring");
const TrapHints = require("./trap-hints.js");

const setup = () => {
  throw new Error("Setup should not be called outside aran-remote");
};

const identity = (argument) => argument;

module.exports = (Analysis, options) => {
  options = {
    "port":                    options["node-port"]    || 8000,
    "aran-namespace":          options["namespace"]    || "ARAN",
    "aran-format":             options["format"]       || "estree",
    "aran-roots":              options["roots"]        || [],
    "melf-alias":              options["alias"]        || "aran",
    "melf-log"                 options["log"]          || false,
    "melf-share-synchronous":  options["synchronous"]  || false,
    "otiluke-port":            options["browser-port"] || null,
    "otiluke-argm-prefix":     options["argm-prefix"]  || "ARAN-",
    "otiluke-splitter":        options["splitter"]     || "ARAN",
    "otiluke-ca-home":         options["ca-home"]      || null,
    "otiluke-global-var":      options["global-var"]   || "ARAN_TRANSFORM",
    "otiluke-socket-dir":      options["socket-dir"]   || null
  };
  const analyses = {__proto__:null};
  const generate = options["aran-format"] === "estree" ? Astring.generate : identity;
  const aran = Aran({
    namespace: options["aran-namespace"],
    format: options["aran-format"],
    roots: options["aran-roots"]
  });
  if (!options["melf-share-synchronous"]) {
    return new Promise((resolve, reject) => {
      require("./orchestrator.js")(options, (error, {receptor, server, proxy}) => {
        if (error)
          return reject(error);
        const melf = Melf(receptor, options["melf-alias"]);
        const share = MelfShare(melf, {synchronous:false});
        melf.rprocedures["initialize"] = (origin, data, callback) => {
          const promise = Analysis({
            alias: origin,
            argm: data.argm,
            global: share.instantiate(data.global)
          });
          promise.catch(callback);
          promise.then((analysis) => {
            analyses[origin] = analysis;
            callback(null, {
              namespace: aran.namespace,
              setup: generate(aran.setup()),
            });
          });
        };
        melf.rprocedures["transform"] = (origin, {script, source}, callback) => {
          const promise = analyses[origin].transform(script, source);
          promise.catch(callback);
          promise.then((script) => { callback(null, script) });
        };
        Object.keys(TrapHints).forEach((name) => {
          const hints = TrapHints[name];
          switch (hints.length) {
            case 0: melf.rprocedures[name] = (origin, data, callback) => { const promise = analyses[origin].advice[name](                                                                                                                data[0]); promise.catch(callback); promise.then((result) => { callback(null, share.serialize(result), "value") }) };
            case 1: melf.rprocedures[name] = (origin, data, callback) => { const promise = analyses[origin].advice[name](share.instantiate(data[0]),                                                                                     data[1]); promise.catch(callback); promise.then((result) => { callback(null, share.serialize(result), "value") }) };
            case 2: melf.rprocedures[name] = (origin, data, callback) => { const promise = analyses[origin].advice[name](share.instantiate(data[0]), share.instantiate(data[1]),                                                         data[2]); promise.catch(callback); promise.then((result) => { callback(null, share.serialize(result), "value") }) };
            case 3: melf.rprocedures[name] = (origin, data, callback) => { const promise = analyses[origin].advice[name](share.instantiate(data[0]), share.instantiate(data[1]), share.instantiate(data[2]),                             data[3]); promise.catch(callback); promise.then((result) => { callback(null, share.serialize(result), "value") }) };
            case 4: melf.rprocedures[name] = (origin, data, callback) => { const promise = analyses[origin].advice[name](share.instantiate(data[0]), share.instantiate(data[1]), share.instantiate(data[2]), share.instantiate(data[3]), data[4]); promise.catch(callback); promise.then((result) => { callback(null, share.serialize(result), "value") }) };
            default: throw new Error("Invalid hints length: "+JSON.stringify(hints));
          }
        });
        resolve({__proto__: aran, setup, share, server, proxy});
      });
    });
  }  
  const semaphore = Path.join(Os.tmpdir(), Date.now().toString(36)+"-"+Math.random().toString(36).substring(2));
  const child = ChildProcess.fork(Path.join(__dirname, "orchestrator.js"), [semaphore, JSON.stringify(options)]);
  while (true) {
    try {
      Fs.unlinkSync(semaphore);
      break;
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }
  const melf = Melf(options["port"], options["melf-alias"]);
  const share = MelfShare(melf, {synchronous:true});
  melf.rprocedures["initialize"] = (origin, data, callback) => {
    try {
      analyses[origin] = Analysis({
        origin: origin,
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
  Object.keys(TrapHints).forEach((name) => {
    const hints = TrapHints[name];
    switch (hints.length) {
      case 0: melf.rprocedures[name] = (origin, data, callback) => { try { callback(null, share.serialize(analyses[origin].advice[name](                                                                                                                data[0]), "value")) } catch (error) { callback(error) } }; break;
      case 1: melf.rprocedures[name] = (origin, data, callback) => { try { callback(null, share.serialize(analyses[origin].advice[name](share.instantiate(data[0]),                                                                                     data[1]), "value")) } catch (error) { callback(error) } }; break;
      case 2: melf.rprocedures[name] = (origin, data, callback) => { try { callback(null, share.serialize(analyses[origin].advice[name](share.instantiate(data[0]), share.instantiate(data[1]),                                                         data[2]), "value")) } catch (error) { callback(error) } }; break;
      case 3: melf.rprocedures[name] = (origin, data, callback) => { try { callback(null, share.serialize(analyses[origin].advice[name](share.instantiate(data[0]), share.instantiate(data[1]), share.instantiate(data[2]),                             data[3]), "value")) } catch (error) { callback(error) } }; break;
      case 4: melf.rprocedures[name] = (origin, data, callback) => { try { callback(null, share.serialize(analyses[origin].advice[name](share.instantiate(data[0]), share.instantiate(data[1]), share.instantiate(data[2]), share.instantiate(data[3]), data[4]), "value")) } catch (error) { callback(error) } }; break;
      default: throw new Error("Invalid hints length: "+JSON.stringify(hints));
    }
  });
  return {__proto__:aran, setup, share, child};
};
