# AranRemote

Deploy Aran's analyses on distributed programs, for free.

```js
const AranRemote = require("aran-remote");
const Astring = require("astring");
const Acorn = require("acorn");
const advice = {};
const apply
advice.apply = () => {};
const transform = (script, source) => 
const {child, aran, share} = AranRemote(({global, argm}) => ({
  advice
  transform: (script, source) => 
}) 
}, {"node-port":8000});
```

## `child = require("aran-remote")(analysis, options)`

* `analysis = Analysis({aran, share})`
  * `aran :: Aran`
    The Aran instance.
  * `share :: MelfShare`
    The MelfShare instance.
  * `{transform, advice} = analysis({global, argm})`
    * `argm :: object`
      User-defined options (cf Otiluke).
    * `global :: proxy`
      Synchonous proxy for remote global object.
    * `script2 = transform(script1, source)`
      * `script1 :: string`:
        Orginal string.
      * `source :: string`:
        Describe the origin of the script (cf Otiluke).
      * `script2 :: string`:
        Transformed script (maybe identical).
    * `advice :: object`:
      Object containing Aran traps.