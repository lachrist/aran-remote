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

// Array.js
console.log("Array.js");
(function () {
if ([1,2,3][0] !== 1)
  throw new Error("Array");
} ());

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

// Block.js
console.log("Block.js");
(function () {
(function () {
  {let x = 1}
  if (typeof x !== "undefined")
    throw new Error("Block1");
  {var y = 1}
  if (y !== 1)
    throw new Error("Block2");
} ());
} ());

// Break.js
console.log("Break.js");
(function () {
a:{
  break a;
  throw new Error("Break1");
}
while (true) {
  break;
  throw new Error("Break2");
}
} ());

// Call.js
console.log("Call.js");
(function () {
if ((() => 1)() !== 1)
  throw new Error("Call");
} ());

// Conditional.js
console.log("Conditional.js");
(function () {
if ((true?1:2) !== 1)
  throw new Error("Conditional1");
if ((false?1:2) !== 2)
  throw new Error("Conditional2");
} ());

// Const.js
console.log("Const.js");
(function () {
{
  const c = "foo";
  try {
    c = "bar";
  } catch (_) {
  }
  if (c !== "foo")
    throw new Error("Const1");
}
if (typeof c !== "undefined")
  throw new Error("Const2");
} ());

// Continue.js
console.log("Continue.js");
(function () {
let x = true;
while (x) {
  x = false;
  continue;
  throw new Error("Continue1");
}
let y = true;
a : while (y) {
  y = false;
  continue a;
  throw new Error("Continue2");
}
} ());

// Declaration.js
console.log("Declaration.js");
(function () {
let x, y = 1;
if (x !== undefined)
  throw new Error("Declaration1");
if (y !== 1)
  throw new Error("Declaration2");
} ());

// DeclarationFor.js
console.log("DeclarationFor.js");
(function () {
(function () {
  for (var i=0; i<3; i++) {}
  if (i !== 3)
    throw new Error("DeclarationFor");
} ());
} ());

// DeclarationForIn.js
console.log("DeclarationForIn.js");
(function () {
(function () {
  for (var k in {a:1}) {}
  if (k !== "a")
    throw new Error("DeclarationForIn");
} ());
} ());

// DeclarationForOf.js
console.log("DeclarationForOf.js");
(function () {
(function () {
  for (var x of ["foo"]) {}
  if (x !== "foo")
    throw new Error("ForOf");
} ());
} ());

// Definition.js
console.log("Definition.js");
(function () {
(function () {
  f();
  function f () {}
} ());
} ());

// DoWhile.js
console.log("DoWhile.js");
(function () {
let i = 0;
do {
  i++;
} while (i < 3)
if (i !== 3)
  throw new Error("DoWhile");
} ());

// Empty.js
console.log("Empty.js");
(function () {
;
} ());

// EvalCall.js
console.log("EvalCall.js");
(function () {
let x = 1;
if (eval("x") !== 1)
  throw new Error("EvalCall");
} ());

// Expression.js
console.log("Expression.js");
(function () {
"foo";
} ());

// For.js
console.log("For.js");
(function () {
let i;
for (i=0; i<3; i++) {}
if (i !== 3)
  throw new Error("For");
} ());

// ForIn.js
console.log("ForIn.js");
(function () {
let k;
for (k in {a:1}) {}
if (k !== "a")
  throw new Error("DeclarationForIn");
} ());

// ForOf.js
console.log("ForOf.js");
(function () {
let x;
for (x of ["foo"]) {}
if (x !== "foo")
  throw new Error("ForOf");
} ());

// Function.js
console.log("Function.js");
(function () {
let f = function () { return 1 }
if (f() !== 1)
  throw new Error("Function");
} ());

// Identifier.js
console.log("Identifier.js");
(function () {
let x = 1;
if (x !== 1)
  throw new Error("Identifier");
} ());

// IdentifierAssignment.js
console.log("IdentifierAssignment.js");
(function () {
let x;
x = 1;
if (x !== 1)
  throw new Error("IdentifierAssignment1");
x += 2;
if (x !== 3)
  throw new Error("IdentifierAssignment2");
} ());

// IdentifierDelete.js
console.log("IdentifierDelete.js");
(function () {
let o = {a:1};
let x;
with (o) {
  if (delete x)
    throw new Error("IdentifierDelete1");
  if (! delete a)
    throw new Error("IdentifierDelete2");
  if (! delete a$strange$id)
    throw new Error("IdentifierDelete3");
}
if ("a" in o)
  throw new Error("IdentifierDelete4");
} ());

// IdentifierForIn.js
console.log("IdentifierForIn.js");
(function () {
let k;
for (k in {a:1}) {}
if (k !== "a")
  throw new Error("IdentifierForIn");
} ());

// IdentifierTypeof.js
console.log("IdentifierTypeof.js");
(function () {
if (typeof 1 !== "number")
  throw new Error("Typeof2");
if (typeof UndefinedVariable !== "undefined")
  throw new Error("Typeof1");
} ());

// IdentifierUpdate.js
console.log("IdentifierUpdate.js");
(function () {
let x = 1;
if (x++ !== 1)
  throw new Error("IdentifierUpdate1");
if (++x !== 3)
  throw new Error("IdentifierUpdate2");
} ());

// If.js
console.log("If.js");
(function () {
if (true) {} else {
  throw new Error("If1");
}
if (false) {
  throw new Error("If2");
} else {}
} ());

// Label.js
console.log("Label.js");
(function () {
a:{
  break a;
  throw new Error("Label");
}
} ());

// Let.js
console.log("Let.js");
(function () {
{
  let l = "foo";
  l = "bar"
  if (l !== "bar")
    throw new Error("Let1");
}
if (typeof l !== "undefined")
  throw new Error("Let2");
} ());

// Literal.js
console.log("Literal.js");
(function () {
true;
false;
1;
-1;
"a";
/abc/g;
} ());

// Logical.js
console.log("Logical.js");
(function () {
if ((false||1) !== 1)
  throw new Error("Logical1");
if ((true&&1) !== 1)
  throw new Error("Logical2");
} ());

// LoopLabel.js
console.log("LoopLabel.js");
(function () {
let i = 0;
a: for (; i<10; i++) {
  if (i === 5)
    break a;
}
if (i !== 5)
  throw new Error("LoopLabel");
} ());

// Member.js
console.log("Member.js");
(function () {
if ({a:1}.a !== 1)
  throw new Error("Member");

} ());

// MemberAssignment.js
console.log("MemberAssignment.js");
(function () {
let o = {};
o.a = 1;
if (o.a !== 1)
  throw new Error("MemberAssignment1");
o.a += 2;
if (o.a !== 3)
  throw new Error("MemberAssignment2");
} ());

// MemberCall.js
console.log("MemberCall.js");
(function () {
let o = {
  f: function () {
    if (this !== o)
      throw new Error("MemberCall");
  }
}
o.f();
} ());

// MemberDelete.js
console.log("MemberDelete.js");
(function () {
let o = {a:1};
delete o.a;
if ("a" in o)
  throw new Error("MemberDelete");
} ());

// MemberForIn.js
console.log("MemberForIn.js");
(function () {
let o = {};
for (o.a in {a:1}) {}
if (o.a !== "a")
  throw new Error("MemberForIn");
} ());

// MemberForOf.js
console.log("MemberForOf.js");
(function () {
let o = {};
for (o.a of ["foo"]) {}
if (o.a !== "foo")
  throw new Error("ForOf");
} ());

// MemberUpdate.js
console.log("MemberUpdate.js");
(function () {
let o = {a:1};
if (o.a++ !== 1)
  throw new Error("MemberUpdate1");
if (++o.a !== 3)
  throw new Error("MemberUpdate2");
} ());

// New.js
console.log("New.js");
(function () {
let o = {};
let F = function () { return o }
if (new F() !== o)
  throw new Error("New");

} ());

// NewTarget.js
console.log("NewTarget.js");
(function () {
let f1 = function () {
  if (new.target !== void 0)
    throw new Error("NewTarget1");
}
f1();
let f2 = function () {
  if (new.target === void 0)
    throw new Error("NewTarget2");
};
new f2();
} ());

// Object.js
console.log("Object.js");
(function () {
let b = "b";
let o = {
  a: 1,
  [b]: 2,
  get c () { return 3 },
  set c (v) {}
};
if (o.a !== 1)
  throw new Error("Object1");
if (o.b !== 2)
  throw new Error("Object2");
o.c = 666;
if (o.c !== 3)
  throw new Error("Object3");
} ());

// PatternArray.js
console.log("PatternArray.js");
(function () {
let [x1,x2] = ["foo1", "bar1"];
if (x1 !== "foo1")
  throw new Error("PatternArray1");
if (x2 !== "bar1")
  throw new Error("PatternArray2");
let [y1, y2, ... ys] = ["foo2", "bar2", "buz2", "qux2"];
if (y1 !== "foo2")
  throw new Error("PatternArray3");
if (y2 !== "bar2")
  throw new Error("PatternArray4");
if (ys[0] !== "buz2")
  throw new Error("PatternArray5");
if (ys[1] !== "qux2")
  throw new Error("PatternArray6");
} ());

// PatternDefault.js
console.log("PatternDefault.js");
(function () {
let [x="foo", y="bar"] = [undefined, null];
if (x !== "foo")
  throw new Error("PatternDefault1");
if (y !== null)
  throw new Error("PatternDefault2");
} ());

// PatternObject.js
console.log("PatternObject.js");
(function () {
let {x, y:z} = {x:"foo", y:"bar"};
if (x !== "foo")
  throw new Error("PatternObject1");
if (z !== "bar")
  throw new Error("PatternObject2");
} ());

// Rest.js
console.log("Rest.js");
(function () {
let f = function (x, ...xs) {
  if (x !== "foo")
    throw new Error("Rest1");
  if (xs[0] !== "bar")
    throw new Error("Rest2");
  if (xs[1] !== "qux")
    throw new Error("Rest3");
};
f("foo", "bar", "qux");
} ());

// Return.js
console.log("Return.js");
(function () {
let f = function () {
  return;
  throw new Error("Return1");
}
if (f() !== undefined)
  throw new Error("Return2");
} ());

// Sequence.js
console.log("Sequence.js");
(function () {
if ((1,2) !== 2)
  throw new Error("Sequence");
} ());

// Spread.js
console.log("Spread.js");
(function () {
let f = function (x, y, z, t) {
  if (x !== 1)
    throw new Error("Spread1");
  if (y !== 2)
    throw new Error("Spread2");
  if (z !== 3)
    throw new Error("Spread3");
  if (t !== 4)
    throw new Error("Spread4")
  if (arguments.length !== 4)
    throw new Error("Spread5");
}
f (1, ...[2,3], 4);
} ());

// StrictFunction.js
console.log("StrictFunction.js");
(function () {
(function () {
  "use strict";
  let f = function () {
    if (this !== undefined)
      throw new Error("Strict");
  }
  f();
} ());
} ());

// StrictProgram.js
console.log("StrictProgram.js");
(function () {
"use strict";
let f = function () {
  if (this !== undefined)
    throw new Error("Strict");
}
f();
} ());

// Switch.js
console.log("Switch.js");
(function () {
let i=0;
switch (2) {
  case 1: throw new Error("Switch1");
  case 2: i++;
  default:
    i++;
    break;
  case 2: throw new Error("Switch2");
}
if(i !== 2)
  throw new Error("Switch3");
} ());

// This.js
console.log("This.js");
(function () {
let o = {
  f:function () {
    if (this !== o)
      throw new Error("This");
  }
}
o.f();
} ());

// Throw.js
console.log("Throw.js");
(function () {
let c = false;
let f = false;
try {
  throw "ok";
  throw "BOUM";
} catch (e) {
  c = e;
} finally {
  f = true;
}
if (c !== "ok")
  throw new Error("Throw1");
if (!f)
  throw new Error("Throw2");
} ());

// Unary.js
console.log("Unary.js");
(function () {
if (!true)
  throw new Error("Unary1");
let o = {a:1,b:2};
delete o.a;
if ("a" in o)
  throw new Error("Unary2");
delete o["b"]
if ("b" in o)
  throw new Error("Unary3");
} ());

// While.js
console.log("While.js");
(function () {
let i = 0;
while (i < 3)
  i++;
if (i !== 3)
  throw new Error("While");
} ());

// With.js
console.log("With.js");
(function () {
let o = {a:1};
with (o) {
  if (a !== 1)
    throw new Error("With1");
  a = 2;
}
if (o.a !== 2)
  throw new Error("With2");
} ());



// EXIT
console.log('\n\nSuccess!\n\n');
process.exit(0);
