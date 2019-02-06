const Net = require("net");
const Path = require("path");
const Http = require("http");
const MelfOrchestrator = require("melf/orchestrator");
const OtilukeBrowserProxy = require("otiluke/browser/proxy");

module.exports = (options, callback) => {
  const receptor = MelfOrchestrator(options["melf-log"]);
  const server = Net.createServer();
  server.on("connection", receptor.ConnectionListener());
  server.on("error", callback);
  server.listen(options["port"], () => {
    server.removeAllListeners("error");
    if (options["otiluke-browser-port"]) {
      function onerror (error) {
        process.stderr.write(this._otiluke_description+" ("+this._otiluke_hostname+") >> "+error.message+"\n");
      }
      const listeners = OtilukeBrowserProxy(Path.join(__dirname, "virus.js"), {
        "ca-home": options["otiluke-ca-home"],
        "socket-dir": options["otiluke-socket-dir"],
        "argm-prefix": options["otiluke-argm-prefix"],
        "global-var": options["otiluke-global-var"],
        handlers: {
          request: receptor.RequestMiddleware(options["otiluke-splitter"]),
          upgrade: receptor.UpgradeMiddleware(options["otiluke-splitter"]),
          forgery: (hostname, server) => {
            server._otiluke_hostname = hostname;
          },
          activity: (description, server, emitter) => {
            emitter._otiluke_description = description;
            emitter._otiluke_hostname = server._otiluke_hostname;
            emitter.on("error", onerror);
          }
        }
      });
      const proxy = Http.createServer();
      proxy._otiluke_hostname = "__PROXY__";
      proxy.on("request", listeners.request);
      proxy.on("connect", listeners.connect);
      proxy.on("upgrade", listeners.upgrade);
      proxy.on("error", (error) => {
        server.close();
        callback(error);
      });
      proxy.listen(options["otiluke-browser-port"], () => {
        proxy.removeAllListeners("error");
        callback(null, {receptor, server, proxy});
      });
    } else {
      callback(null, {receptor, server});
    }
  });
};
