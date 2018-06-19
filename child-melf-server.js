const Path = require("path");
const Http = require("http");
const Minimist = require("minimist");
const MelfServerHandlers = require("melf/server/handlers");

let proxy = null;
const options = Minimist(process.argv.slice(2));
const handlers = MelfServerHandlers();
const server = Http.createServer();
server.on("request", handlers.request);
server.on("upgrade", handlers.upgrade);
server.listen(options["node-port"]||options["port"], () => {
  if ("browser-port" in options) {
    proxy = require("otiluke/browser/proxy")(Path.join(__dirname, "virus.js"), {
      "ca-home": options["ca-home"] || Path.join(__dirname, "ca"),
      "url-search-prefix": options["url-search-prefix"] || "aran-",
      "http-splitter": options["http-splitter"],
      "global-variable": options["global-variable"],
    });
    proxy.on("request", handlers.request);
    proxy.on("upgrade", handlers.upgrade);
    proxy.on("error", (error, location, target) => {
      console.log(error.message+" @"+location);
    });
    proxy.listen(options["browser-port"], () => {
      process.send(null);
    });
  } else {
    process.send(null);
  }
});
process.on("disconnet", () => {
  server.close();
  proxy && proxy.close();
  process.exit(0);
});