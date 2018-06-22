#!/usr/bin/env node
const Minimist = require("minimist");
const AranRemoteNode = require("./index.js");
AranRemoteNode(Minimist(process.argv.slice(2)));