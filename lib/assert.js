'use strict';

var _ = require('lodash');

function newApply(Ctor, args) {
  Array.prototype.unshift.call(args, Ctor);
  return new (Function.prototype.bind.apply(Ctor, args))();
}

module.exports.createAssert = function(ErrorType) {
  return function assert(condition) {
    if (condition)
      return;

    _(arguments).shift();
    throw newApply(ErrorType, arguments);
  };
};
