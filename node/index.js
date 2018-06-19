const Path = require("path");
const OtilukeNode = require("otiluke/node");
const Virus = require(Path.join(__dirname, "..", "virus.js"));
module.exports = (command, antena_options, virus_options) => OtilukeNode(Virus, command, antena_options, virus_options);