
const Fs = require("fs");
const Orchestrator = require("./orchestrator.js");

const semaphore = process.argv[2];
const options = JSON.parse(process.argv[3]);
Orchestrator(options, (error, server, proxy) => {
  if (error)
    process.stderr.write(error.stack);  
  Fs.writeFileSync(semaphore, "");
});
