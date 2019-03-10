
const Net = require("net");
const Path = require("path");
const Http = require("http");
const Distributor = require("melf/lib/distributor");
const Liteners = require("otiluke/browser/proxy");

module.exports = (options, callback) => {
  const server = Net.createServer();
  if (options["browser-port"] === undefined || options["browser-port"] === null) {
    server.on("error", callback);
    server.listen(options["node-port"], () => {
      server.removeListener("error", callback);
      const distributor = Distributor(options["log"]);
      server.on("connection", distributor.ConnectionListener());
      callback(null, {distributor, server});
    });
  } else {
    let proxy = null;
    const cleanup = (error) => {
      error = error instanceof Error ? error : new Error("Early connection");
      sockets.forEach((socket) => { socket.destroy() });
      server.removeAllListeners("listening");
      server.removeAllListeners("error");
      server.close();
      if (proxy) {
        proxy.removeAllListeners("listening");
        proxy.removeAllListeners("error");
        proxy.close();
      }
      callback(error);
    };
    server.on("error", cleanup);
    server.listen(options["node-port"], () => {
      server.on("connection", cleanup);
      proxy = Net.createServer();
      proxy._aran_hostname = "__PROXY__";
      proxy.on("error", cleanup);
      proxy.listen(options["browser-port"], () => {
        server.removeListener("error", cleanup);
        server.removeListener("connection", cleanup);
        proxy.removeListener("error", cleanup);
        server.on("connection", distributor.ConnectionListener());
        const distributor = Distributor(options["log"]);
        const listeners = Liteners(Path.join(__dirname, "virus.js"), Object.assign({
          handlers: {
            request: distributor.RequestMiddleware(options["splitter"]),
            upgrade: distributor.UpgradeMiddleware(options["splitter"]),
            forgery: options.onforgery,
            activity: options.onactivity
          }
        }, options["otiluke"]));
        proxy.removeListener("error", cleanup);
        proxy.on("request", listeners.request);
        proxy.on("connect", listeners.connect);
        proxy.on("upgrade", listeners.upgrade);
        callback(null, {distributor, sockets, server, proxy});
      });
    });    
  }
};
