
const ChildProcess = require("child_process");
const Path = require("path");

const signal = (hostname, location, message) => { console.error(hostname+" >> "+location+" >> "+message) };

module.exports = (options, callback) => {
   //  , {execArgv:['--inspect-brk=9230']}
  const child = ChildProcess.fork(Path.join(__dirname, "bin.js"), [JSON.stringify(options)]);
  child.on("exit", (code) => { throw new Error("Exit ("+code+") before result message") });
  child.once("message", (message) => {
    if (message) return callback(new Error(message));
    child.removeAllListeners("exit");
    const promise = new Promise((resolve, reject) => {
      child.on("message", ({benign, hostname, location, message}) => {
        if (benign) promise.onbenign(hostname, location, message);
        else reject(new Error(hostname+" >> "+location+" >> "+message));
      });
      child.on("exit", (code) => {
        if (code !== 0) throw new Error("Exit ("+code+")");
        resolve(null);
      });
    });
    promise.address = options["node-port"];
    promise.close = () => { child.kill("SIGTERM") };
    promise.interrupt = () => {
      child.kill("SIGINT");
      reject(new Error("Interrupted by the user"));
    };
    promise.onbenign = signal;
    callback(null, promise);
  });
};
