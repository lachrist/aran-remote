
const Common = require("./common.js");

const options = JSON.parse(process.argv[2]);

const forgeries = new Set();

function onclose () {
  forgeries.delete(this);
};

function onerror (error) {
  process.send({
    benign: this._aran_benign,
    hostname: this._aran_hostname,
    location: this._aran_location,
    message: error.message
  });
  if (!this._aran_benign) process.exit(0);
}

function onotilukeconnection (socket) {
  socket._aran_hostname = this._aran_hostname;
  socket._aran_location = "socket";
  socket._aran_benign = true;
  socket.on("error", onerror);
}

function onconnection (socket) {
  socket._aran_hostname = this._aran_hostname;
  socket._aran_location = "socket";
  socket._aran_benign = false;
  socket.on("error", onerror);
}

options.onactivity = (hostname, location, socket) => {
  if (description === "forward-request") socket = socket.socket;
  socket._aran_hostname = hostname;
  socket._aran_location = location;
  socket._aran_benign = true;
  socket.on("error", onerror);
};

options.onforgery = (hostname, server) => {
  server._aran_hostname = hostname;
  server._aran_location = "server";
  server._aran_benign = false;
  server.on("error", onerror);
  server.on("connection", onotilukeconnection);
  server.on("close", onclose);
  forgeries.add(server);
};

Common(options, (error, {distributor, server, proxy}) => {
  if (error) {
    process.send(error.message);
    process.exit(0);
  } else {
    server._aran_hostname = "__SERVER__";
    server._aran_location = "server";
    server._aran_benign = false;
    server.on("error", onerror);
    server.on("connection", onconnection);
    if (proxy) {
      proxy._aran_hostname = "__PROXY__";
      proxy._aran_location = "server";
      proxy._aran_benign = false;
      proxy.on("error", onerror);
      proxy.on("connection", onconnection);
      process.on("SIGTERM", () => {
        server.close();
        for (let server of forgeries) server.close();
        proxy.close();
      });
    } else {
      process.on("SIGTERM", () => { server.close() });
    }
    process.send(null);
  }
});
