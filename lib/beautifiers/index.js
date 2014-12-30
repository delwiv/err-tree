'use strict';

var makeError = require('../make-error');

module.exports.default = require('./default');
module.exports.complex = require('./complex');

module.exports.get = function get(name, options) {
  if (!(name in module.exports))
    throw new makeError.ErrtreeError('Invalid beautifier (' + name + ')');
  return module.exports[name](options);
};

