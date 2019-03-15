
const ChildProcess = require("child_process");
const Path = require("path");

// const signal = (location, hostname, message) => {
//   console.error(location+" >> "+hostname+" >> "+message);
// };

module.exports = (options, callback) => {
  // , {execArgv:['--inspect-brk=9230']}
  const child = ChildProcess.fork(Path.join(__dirname, "bin.js"), [JSON.stringify(options)]);
  child.on("exit", (code) => { throw new Error("Orchestrator process exit ("+code+") before result message") });
  child.once("message", (message) => {
    if (message) return callback(new Error(message));
    child.removeAllListeners("exit");
    let resolve, reject;
    const promise = new Promise((closure1, closure2) => {
      resolve = closure1;
      reject = closure2;
    });
    // child.on("message", ({location, hostname, message}) => {
    //   promise.onfailure(location, hostname, message);
    // });
    child.on("exit", (code) => {
      if (code !== 0 && code !== null) throw new Error("Orchestrator process exit ("+code+")");
      resolve(null);
    });
    promise.address = options["node-port"];
    promise.terminate = () => child.kill("SIGTERM");
    promise.destroy = () => {
      child.kill("SIGINT");
      reject(new Error("Destroyed by the user"));
    };
    // promise.onfailure = signal;
    callback(null, promise);
  });
};
