'use strict';

var makeError = require('../make-error');

module.exports.default = require('./default');
module.exports.i18next = require('./i18next');

module.exports.get = function get(name, options) {
  if (!(name in module.exports))
    throw new makeError.ErrorMakerError('Invalid message handler (' + name + ')');
  return module.exports[name](options);
};
