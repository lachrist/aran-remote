
const Acorn = require("acorn");
const AranAccess = require("aran-access");

module.exports = (aran, share) => {
  const wrappers = new WeakSet();
  const membrane = {
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
  };
  const access = AranAccess(membrane);
  return (global, options) => ({
    eval: ($$script, serial) => access.release(membrane.leave($$script)),
    parse: (script, source) => Acorn.parse(script),
    advice: access.advice 
  });
};
