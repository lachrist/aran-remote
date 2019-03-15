
const Common = require("./common.js");

// const signal = (location, hostname, message) => {
//   console.error(location+" >> "+hostname+" >> "+message);
// };

module.exports = (options, callback) => {
  const promise = new Promise((resolve, reject) => {
    Common(options, (location, hostname, message) => {
      console.error(location+" >> "+hostname+" >> "+message);
      // promise.onfailure(location, hostname, message);
    }, (error, {distributor, server, proxy}) => {
      if (error) return callback(error);
      const sockets = new Set();
      function onsocketclose () {
        sockets.delete(this);
      }
      server.on("connection", (socket) => {
        sockets.add(socket);
        socket.on("close", onsocketclose);
      });
      const failure = (error) => {
        server.close();
        for (let socket of sockets) socket.destroy();
        if (proxy) proxy.destroy();
        reject(error);
      };
      server.on("close", () => {
        if (!proxy || !proxy.listening) resolve(null) 
      });
      if (proxy) proxy.on("close", () => {
        // Unlike for the forked orchestrator, it is not
        // guaranteed that all the servers/sockets closed
        // gracefully
        proxy.closeAll();
        proxy.destroyAll();
        if (!server.listening) resolve(null);
      });
      // promise.onfailure = signal;
      promise.address = distributor;
      promise.destroy = () => failure(new Error("Destroyed by the user"));
      promise.terminate = () => {
        server.close();
        if (proxy) proxy.closeAll();
      };
      callback(null, promise);
    });
  });
};
