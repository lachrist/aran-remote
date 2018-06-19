const OtilukeNode = require("otiluke/node")
module.exports = (command, antena_options, virus_options) => OtilukeNode(Path.join(__dirname, "..", "virus.js"), command, antena_options, virus_options);