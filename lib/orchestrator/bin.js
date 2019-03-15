const Common = require("./common.js");
Common(JSON.parse(process.argv[2]), (location, hostname, message) => {
  console.error(location+" >> "+hostname+" >> "+message);
  // process.send({location, hostname, message});
}, (error, result) => {
  if (error) {
    process.send(error.message);
    process.exit(0);
  } else {
    process.on("SIGTERM", () => {
      result.server.close();
      if (result.proxy) result.proxy.closeAll();
    });
    process.send(null);
  }
});