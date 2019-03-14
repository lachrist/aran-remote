
const Net = require("net");
const Path = require("path");
const Http = require("http");
const Distributor = require("melf/lib/distributor");
const OtilukeBrowser = require("otiluke/browser");

module.exports = (options, onfailure, callback) => {
  const server = Net.createServer();
  server.on("error", callback);
  server.listen(options["node-port"], () => {
    server.removeListener("error", callback);
    const distributor = Distributor(options["log"]);
    server.on("connection", distributor.ConnectionListener());
    if (options.otiluke.port === undefined || options.otiluke.port === null) {
      callback(null, {distributor, server, proxy:null});
    } else {
      const proxy = OtilukeBrowser(Path.join(__dirname, "..", "virus.js"), Object.assign(options.otiluke, {
        onfailure,
        intercept: {
          request: distributor.RequestMiddleware(options.splitter),
          upgrade: distributor.UpgradeMiddleware(options.splitter)
        }
      }));
      const cleanup = (error) => {
        server.close();
        callback(error instanceof Error ? error : new Error("Early connection"));
      }
      server.on("connection", cleanup);
      proxy.on("error", cleanup);
      proxy.listen(options.otiluke.port, () => {
        server.removeListener("connection", cleanup);
        proxy.removeListener("error", cleanup);
        callback(null, {distributor, server, proxy});
      });
    }
  });
};
