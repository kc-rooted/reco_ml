// Comprehensive Node.js util polyfill for TensorFlow.js compatibility
import * as Module from 'module';

// Patch the require function to intercept util module loads
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id: string) {
  const module = originalRequire.apply(this, arguments as any);
  
  if (id === 'util') {
    // Add the missing isNullOrUndefined function
    if (!module.isNullOrUndefined) {
      module.isNullOrUndefined = function (val: any): boolean {
        return val === null || val === undefined;
      };
    }
  }
  
  return module;
};

// Also patch the global util if it exists
const util = require('util');
if (!util.isNullOrUndefined) {
  util.isNullOrUndefined = function (val: any): boolean {
    return val === null || val === undefined;
  };
}

export {};