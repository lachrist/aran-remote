// Arguments.js
console.log("Arguments.js");
(function () {
let f = function () {
  if (arguments[0] !== "foo")
    throw new Error("Arguments1");
  if (arguments[1] !== "bar")
    throw new Error("Arguments2");
  if (arguments.length !== 2)
    throw new Error("Arguments3");
};
f("foo", "bar");
} ());

// // Array.js
// console.log("Array.js");
// (function () {
// if ([1,2,3][0] !== 1)
//   throw new Error("Array");
// } ());

// Arrow.js
console.log("Arrow.js");
(function () {
let a1 = () => "foo";
let a2 = () => { return "bar" };
if (a1() !== "foo")
  throw new Error("Arrow1");
if (a2() !== "bar")
  throw new Error("Arrow2");
let check = false;
try {
  new a1();
} catch (error) {
  check = true;
}
if (!check)
  throw new Error("Arrow3");
} ());

// Binary.js
console.log("Binary.js");
(function () {
if (1+2 !== 3)
  throw new Error("Binary");
} ());
