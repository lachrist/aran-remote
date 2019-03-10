const Fs = require("fs");
const Path = require("path");
const dirname = Path.join(__dirname, "..", "..", "..", "aran", "test", "target", "atom");
const content = Fs.readdirSync(dirname).filter((filname) => filname.endsWith(".js")).sort().map((filname) => {
  return "// "+filname+"\nconsole.log("+JSON.stringify(filname)+");\n(function () {\n"+Fs.readFileSync(Path.join(dirname, filname), "utf8")+"\n} ());\n\n";
}).join("");
Fs.writeFileSync(Path.join(__dirname, "main.js"), content, "utf8");