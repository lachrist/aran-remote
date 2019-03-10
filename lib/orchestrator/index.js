
const Inline = require("./inline.js");
const Forked = require("./forked.js");

module.exports = (options, callback) => {
  if (options["inline"]) Inline(options, callback);
  else Forked(options, callback);
};
