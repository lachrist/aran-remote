#!/usr/bin/env node
const Minimist = require("minimist");
const AranRemoteNode = require("./index.js");
const options = Minimist(process.argv.slice(2));
const command = options._;
const antena_options = {host:options.host, secure:options.secure};
delete options._;
delete options.host;
delete options.secure;
AranRemoteNode(command, antena_options, options);