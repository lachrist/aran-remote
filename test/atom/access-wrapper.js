
const Acorn = require("acorn");
const AranAccess = require("aran-access");

module.exports = (aran, share) => {
  const wrappers = new WeakSet();
  const access = AranAccess({
    enter: (value) => {
      const wrapper = {inner:value};
      wrappers.add(wrapper);
      return wrapper;
    },
    leave: (wrapper) => {
      if (wrappers.has(wrapper))
        return wrapper.inner;
      throw new Error("Not a wrapper: ", wrapper);
    }
  });
  return (global, options) => ({
    parse: (script, source) => Acorn.parse(script),
    advice: access.advice 
  });
};
