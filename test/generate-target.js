const Fs = require("fs");
const Path = require("path");
const dirname = Path.join(__dirname, "..", "..", "..", "aran", "test", "target", "atom");
Fs.writeFileSync(
  Path.join(__dirname, "target.js"),
  (
    Fs.readdirSync(dirname)
      .filter((filname) => filname.endsWith(".js"))
      .sort()
      .map((filname) => "// "+filname+"\nconsole.log("+JSON.stringify(filname)+");\n(function () {\n"+Fs.readFileSync(Path.join(dirname, filname), "utf8")+"\n} ());\n\n")
      .join("") +
    "\n\n// EXIT\nconsole.log('\\n\\nSuccess!\\n\\n');\nprocess.exit(0);\n"),
  "utf8");