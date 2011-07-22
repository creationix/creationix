// This is a super simple module system for use in the browser.  You first
// define your module using the "define" function and then later require it
// using "require" This does not support circular dependencies or require search
// paths.  It's a simple module repository for writing clean code.

(function () {

// Store our repository in private variables in this closure.
var defs = {},
    modules = {};

// When the user defines a module's setup function, store it here.
function define(name, fn) {
  defs[name] = fn;
}

// The first time a module is used, it's description is executed and cached.
function require(name) {
  if (modules.hasOwnProperty(name)) return modules[name];
  if (defs.hasOwnProperty(name)) {
    var exports = modules[name] = {};
    var module = {exports:exports};
    var fn = defs[name];
    fn(module, exports);
    return modules[name] = module.exports;
  }
  throw new Error("Module not found: " + name);
}

// Expose our public API on the global object.
this.define = define;
this.require = require;

}());

