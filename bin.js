#!/usr/bin/env node
const Path = require("path");
const Minimist = require("minimist");
const AranRemote = require("./main.js");
const options = Minimist(process.argv.slice(2));
const RemoteAnalysis = require(Path.resolve(options["remote-analysis"]));
delete options["remote-analysis"];
const child = AranRemote(RemoteAnalysis, options);
process.on("SIGINT", () => { child.kill("SIGINT") });
process.on("SIGTERM", () => { child.kill("SIGTERM") });