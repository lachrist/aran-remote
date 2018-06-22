
///////////////
// Combiners //
///////////////
exports.apply = ["function", ["argument"], "serial"];
exports.array = ["array", "serial"];
exports.binary = ["operator", "left", "right", "serial"];
exports.construct = ["constructor", ["argument"], "serial"];
exports.delete = ["object", "key", "serial"];
exports.get = ["object", "key", "serial"];
exports.invoke = ["function", "this", ["argument"], "serial"];
exports.object = [["key"], "object", "serial"];
exports.set = ["object", "key", "value", "serial"];
exports.unary = ["operator", "argument", "serial"];

///////////////
// Producers //
///////////////
exports.arrival = ["strict", {}, "serial"];
exports.begin = ["strict", {}, "serial"];
exports.catch = ["error", "serial"];
exports.closure = ["function", "serial"];
exports.discard = ["identifier", "success", "serial"];
exports.load = ["name", "builtin", "serial"];
exports.primitive = ["primitive", "serial"];
exports.read = ["identifier", "value", "serial"];
exports.regexp = ["regexp", "serial"];

///////////////
// Consumers //
///////////////
exports.completion = ["value", "serial"];
exports.declare = ["kind", "identifier", "value", "serial"];
// exports.eval = ["script", "serial"];
exports.failure = [{}, "error", "serial"];
exports.return = [{}, "result", "serial"];
exports.save = ["string", "any", "serial"];
exports.success = [{}, "value", "serial"];
exports.test = ["value", "serial"];
exports.throw = ["error", "serial"];
exports.with = ["environment", "serial"];
exports.write = ["identifier", "value", "serial"];

///////////////
// Informers //
///////////////
exports.block = ["serial"];
exports.break = ["continue", "label", "serial"];
exports.copy = ["position", "serial"];
exports.drop = ["serial"];
exports.end = [{}, "serial"];
exports.finally = ["serial"];
exports.label = ["continue", "label", "serial"];
exports.leave = ["type", "serial"];
exports.swap = ["position1", "position2", "serial"];
exports.try = ["serial"];

