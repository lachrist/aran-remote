
///////////////
// Combiners //
///////////////
exports.apply = ["function", ["argument"]];
exports.array = ["array"];
exports.binary = ["operator", "left", "right"];
exports.construct = ["constructor", ["argument"]];
exports.delete = ["object", "key"];
exports.get = ["object", "key"];
exports.invoke = ["function", "this", ["argument"]];
exports.object = [["key"], "object"];
exports.set = ["object", "key", "value"];
exports.unary = ["operator", "argument"];

///////////////
// Producers //
///////////////
exports.arrival = ["strict", {}];
exports.begin = ["strict", {}];
exports.catch = ["error"];
exports.closure = ["function"];
exports.discard = ["identifier", "success"];
exports.load = ["name", "builtin"];
exports.primitive = ["primitive"];
exports.read = ["identifier", "value"];
exports.regexp = ["regexp"];

///////////////
// Consumers //
///////////////
exports.completion = ["value"];
exports.declare = ["kind", "identifier", "value"];
exports.eval = ["script"];
exports.failure = [{}, "error"];
exports.return = [{}, "result"];
exports.save = ["string", "any"];
exports.success = [{}, "value"];
exports.test = ["value"];
exports.throw = ["error"];
exports.with = ["environment"];
exports.write = ["identifier", "value"];

///////////////
// Informers //
///////////////
exports.block = [];
exports.break = ["continue", "label"];
exports.copy = ["position"];
exports.drop = [];
exports.end = [{}];
exports.finally = [];
exports.label = ["continue", "label"];
exports.leave = ["type"];
exports.swap = ["position1", "position2"];
exports.try = [];

