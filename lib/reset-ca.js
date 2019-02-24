const Path = require("path");
const cahome = process.argv.length > 2 ? Path.resolve(process.argv[2]) : Path.join(__dirname, "..", "ca");
require("otiluke/browser/ca/index.js")({
  subj: "/CN=aran-remote/O=AranRemote",
  "ca-home": cahome
});
console.log("New self-signed certificate generated at: "+cahome+"/cert.pem");