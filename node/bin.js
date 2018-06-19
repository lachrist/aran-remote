#!/usr/bin/env node
const OtilukeNode = require("otiluke/node");
const Minimist = require("minimist");
OtilukeNode(Path.join(__dirname, "virus.js"), Minimist(process.argv.slice(2)));