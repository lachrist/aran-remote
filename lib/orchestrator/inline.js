
const Common = require("./common.js");

const signal = (hostname, location, message) => { console.error(hostname+" >> "+location+" >> "+message) };

module.exports = (options, callback) => {
  const promise = new Promise((resolve, reject) => {
    const servers = new Set();
    const sockets = new Set();
    const failure = (error) => {
      for (let socket of sockets) socket.destroy();
      for (let server of servers) server.close();
      reject(error);
    }
    function onserverclose () {
      servers.delete(this);
      if (servers.size === 0) resolve();
    };
    function onsocketclose () { sockets.delete(this) };
    function onerror (error) {
      if (this._aran_benign) promise.onbenign(hostname, location, message);
      else failure(new Error(this._aran_hostname+" >> "+this._aran_location+" >> "+error.message));
    }
    function onotilukeconnection (socket) {
      socket._aran_hostname = this._aran_hostname;
      socket._aran_location = "socket";
      socket._aran_benign = true;
      socket.on("error", onerror);
      sockets.track(socket);
    }
    function onconnection (socket) {
      socket._aran_hostname = this._aran_hostname;
      socket._aran_location = "socket";
      socket._aran_benign = false;
      socket.on("error", onerror);
      socket.on("close", onsocketclose);
      sockets.add(socket);
    }
    options.onforgery = (hostname, server) => {
      server._aran_hostname = hostname;
      server._aran_location = "server";
      server._aran_benign = false;
      server.on("error", onerror);
      server.on("connection", onotilukeconnection);
      server.on("close", onserverclose);
      servers.add(server);
    };
    options.onactivity = (hostname, location, socket) => {
      if (description === "forward-request") socket = socket.socket;
      socket._aran_hostname = hostname;
      socket._aran_location = location;
      socket._aran_benign = true;
      socket.on("error", onerror);
      sockets.track(socket);
    };
    Common(options, (error, {distributor, server, proxy}) => {
      if (error) return callback(error);
      server._aran_hostname = "__SERVER__";
      server._aran_location = "server";
      server._aran_benign = false;
      server.on("error", onerror);
      server.on("connection", onconnection);
      server.on("close", onserverclose);
      servers.add(server);
      if (proxy) {
        proxy._aran_hostname = "__PROXY__";
        proxy._aran_location = "server";
        proxy._aran_benign = false;
        proxy.on("error", onerror);
        proxy.on("connection", onconnection);
        server.on("close", onserverclose);
        servers.add(proxy);
      }
      promise.onbenign = signal;
      promise.address = distributor;
      promise.interrupt = () => { failure(new Error("Interrupted by the user")) };
      promise.close = () => { for (let server of servers) server.close() };
      callback(null, promise);
    });
  });
};
