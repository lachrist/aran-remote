
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
    "otiluke-ca-home":         "ca-home"      in options ? options["ca-home"]      : null,
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
  if (!options["melf-share-synchronous"]) {
    return new Promise((resolve, reject) => {
      require("./orchestrator.js")(options, (error, result) => {
        if (error)
          return reject(error);
        const {receptor, server, proxy} = result;
        const melf = Melf(receptor, options["melf-alias"]);
        const share = MelfShare(melf, {synchronous:false});
        melf.rprocedures["initialize"] = (origin, data, callback) => {
          Analysis({
            alias: origin,
            argm: data.argm,
            global: share.instantiate(data.global)
          }).then((analysis) => {
            analyses[origin] = analysis;
            callback(null, {
              namespace: aran.namespace,
              setup: generate(aran.setup()),
            });
          }, callback);
        };
        melf.rprocedures["transform"] = (origin, {script, source}, callback) => {
          const promise = analyses[origin].transform(script, source);
          promise.catch(callback);
          promise.then((script) => { callback(null, script) });
        };
        Object.keys(TrapHints).forEach((name) => {
          const hints = TrapHints[name];
          switch (hints.length) {
            case 0: melf.rprocedures[name] = (origin, data, callback) => { const promise = analyses[origin].advice[name](                                                                                                                data[0]); promise.catch(callback); promise.then((result) => { callback(null, share.serialize(result), "value") }, callback) }; break;
            case 1: melf.rprocedures[name] = (origin, data, callback) => { const promise = analyses[origin].advice[name](share.instantiate(data[0]),                                                                                     data[1]); promise.catch(callback); promise.then((result) => { callback(null, share.serialize(result), "value") }, callback) }; break;
            case 2: melf.rprocedures[name] = (origin, data, callback) => { const promise = analyses[origin].advice[name](share.instantiate(data[0]), share.instantiate(data[1]),                                                         data[2]); promise.catch(callback); promise.then((result) => { callback(null, share.serialize(result), "value") }, callback) }; break;
            case 3: melf.rprocedures[name] = (origin, data, callback) => { const promise = analyses[origin].advice[name](share.instantiate(data[0]), share.instantiate(data[1]), share.instantiate(data[2]),                             data[3]); promise.catch(callback); promise.then((result) => { callback(null, share.serialize(result), "value") }, callback) }; break;
            case 4: melf.rprocedures[name] = (origin, data, callback) => { const promise = analyses[origin].advice[name](share.instantiate(data[0]), share.instantiate(data[1]), share.instantiate(data[2]), share.instantiate(data[3]), data[4]); promise.catch(callback); promise.then((result) => { callback(null, share.serialize(result), "value") }, callback) }; break;
            default: throw new Error("Invalid hints length: "+JSON.stringify(hints));
          }
        });
        const toPrimitive = async (value, hint) => {
          if (value === null || (typeof value !== "object" && typeof value !== "function"))
            return value;
          const toPrimitive = await share.reflect.get(value, Symbol.toPrimitive);
          if (toPrimitive !== undefined) {
            value = await share.reflect.apply(toPrimitive, value, [hint]);
          } else {
            const method1 = await share.reflect.get(value, hint === "string" ? "toString" : "valueOf");
            if (typeof method1 === "function") {
              value = await share.reflect.apply(method1, value, []);
            } else {
              const method2 = await share.reflect.get(value, hint === "string" ? "valueOf" : "toString");
              if (method2 === "function") {
                value = await share.reflect.apply(method2, value, []);
              }
            }
          }
          if (value !== null && (typeof value === "object" || typeof value === "function"))
            throw new TypeError("Cannot convert object to primitive value");
          return value;
        };
        // https://tc39.github.io/ecma262/#sec-abstract-equality-comparison
        const equalityComparison = async (value1, value2) => {
          if (value1 !== null && (typeof value1 === "object" || typeof value1 === "function")) {
            if (value2 !== null && (typeof value2 === "object" || typeof value2 === "function"))
              return value1 === value2;
            return await toPrimitive(value1) == value2;
          }
          if (value2 !== null && (typeof value2 === "object" || typeof value2 === "function"))
            return value1 == await toPrimitive(value2);
          return value1 == value2;
        };
        resolve({
          __proto__: aran,
          setup,
          share,
          server,
          proxy,
          apply: share.reflect.apply,
          construct: share.reflect.construct,
          // TODO: hint should be based on the context (the operator and, if applicable, the first argument)
          unary: async (operator, argument) => {
            if (operator === "typeof")
              return typeof argument;
            return aran.unary(operator, await toPrimitive(argument));
          },
          binary: async (operator, left, right) => {
            if (operator === "in")
              return share.reflect.has(right, left);
            if (operator === "===")
              return left === right;
            if (operator === "!==")
              return left !== right;
            if (operator === "==")
              return equalityComparison(left, right);
            if (operator === "!=")
              return !equalityComparison(left, right);
            if (operator === "instanceof") {
              Reflect.construct(Boolean, [], right);
              if (left === null || (typeof left !== "object" && typeof left !== "function"))
                return false;
              left = await share.reflect.getPrototypeOf(left);
              const prototype = await share.reflect.get(right, "prototype");
              while (left) {
                if (left === prototype)
                  return true;
                left = await share.reflect.getPrototypeOf(left);
              }
              return false;
            }
            return aran.binary(operator, await toPrimitive(left), await toPrimitive(right));
          }
        });
      });
    });
  }  
  const semaphore = Path.join(Os.tmpdir(), Date.now().toString(36)+"-"+Math.random().toString(36).substring(2));
  const child = ChildProcess.fork(Path.join(__dirname, "orchestrator-bin.js"), [semaphore, JSON.stringify(options)]); // {execArgv:['--inspect-brk=9230']}
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
  return {
    __proto__: aran,
    setup,
    share,
    child,
    apply: Reflect.apply,
    construct: Reflect.construct
  };
};
