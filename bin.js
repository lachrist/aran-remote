#!/usr/bin/env node
const Path = require("path");
const Minimist = require("minimist");
const AranRemote = require("./main.js");
const options = Minimist(process.argv.slice(2));
const RemoteAnalysis = require(Path.resolve(options["remote-analysis"]));
delete options["remote-analysis"];
AranRemoteLite(RemoteAnalysis, options, (error) => {
  if (error) {
    throw error;
  }
});