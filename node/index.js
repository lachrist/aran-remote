const Path = require("path");
const OtilukeNode = require("otiluke/node");
const Virus = require(Path.join(__dirname, "..", "virus.js"));
module.exports = (options) => OtilukeNode(Virus, options);