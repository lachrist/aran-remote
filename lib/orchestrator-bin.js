require("./orchestrator.js")(JSON.parse(process.argv[2]), (error) => {
  if (error)
    throw error;
  process.send("ready");
});