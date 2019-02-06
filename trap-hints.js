
///////////////
// Informers //
///////////////
exports.arrival = ["function", "constructor|undefined", "value", "arguments"];
exports.break = ["label|null"];
exports.continue = ["label|null"];
exports.debugger = [];
exports.enter = ["tag", ["label"], ["indentifier"]];
exports.leave = [];
exports.program = ["object"];

///////////////
// Modifiers //
///////////////
exports.abrupt = ["value"];
exports.argument = ["value", "argument-index"];
exports.builtin = ["value", "builtin-name"];
exports.closure = ["function"];
exports.drop = ["value"];
exports.error = ["value"];
exports.failure = ["value"];
exports.primitive = ["primitive"];
exports.read = ["value", "identifier"];
exports.return = ["value"];
exports.success = ["value"];
exports.test = ["value"];
exports.throw = ["value"];
exports.write = ["value", "identifier"];

///////////////
// Combiners //
///////////////
exports.apply = ["value", "value", ["value"]];
exports.binary = ["binary-operator", "value", "value"];
exports.construct = ["value", ["value"]];
exports.unary = ["unary-operator", "value"];

// 
// ///////////////
// // Producers //
// ///////////////
// exports.arrival = ["strict", {}];
// exports.begin = ["strict", {}];
// exports.catch = ["error"];
// exports.closure = ["function"];
// exports.discard = ["identifier", "success"];
// exports.load = ["name", "builtin"];
// exports.primitive = ["primitive"];
// exports.read = ["identifier", "value"];
// exports.regexp = ["regexp"];
// 
// ///////////////
// // Consumers //
// ///////////////
// exports.completion = ["value"];
// exports.declare = ["kind", "identifier", "value"];
// exports.eval = ["script"];
// exports.failure = [{}, "error"];
// exports.return = [{}, "result"];
// exports.save = ["string", "any"];
// exports.success = [{}, "value"];
// exports.test = ["value"];
// exports.throw = ["error"];
// exports.with = ["environment"];
// exports.write = ["identifier", "value"];
// 
// ///////////////
// // Informers //
// ///////////////
// exports.block = [];
// exports.break = ["continue", "label"];
// exports.copy = ["position"];
// exports.drop = [];
// exports.end = [{}];
// exports.finally = [];
// exports.label = ["continue", "label"];
// exports.leave = ["type"];
// exports.swap = ["position1", "position2"];
// exports.try = [];
