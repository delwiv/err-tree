'use strict';

var _ = require('lodash');

var errTree = module.exports = require('./make-error');

errTree.BasicError = require('./basic-error');
errTree.parseStack = require('./parser');
errTree.fileExerpt = require('./file-exerpt');
errTree.beautifiers = require('./beautifiers');
errTree.messageHandlers = require('./message-handlers');
errTree.createAssert = require('./assert').createAssert;

errTree.setDefaultBeautifier = function(name, options) {
  options = _.defaults(options || {}, {
    onError: false
  });

  var ErrorProto = (options.onError ? Error : errTree.BasicError).prototype;

  ErrorProto.beautifier = errTree.BasicError.prototype.beautifier =
    errTree.beautifiers.get(name, options);

  if (!options.onError)
    return;

  ErrorProto.inspect = ErrorProto.toString = errTree.BasicError.prototype.toString;
  ErrorProto.getExerpt = errTree.BasicError.prototype.getExerpt;
  ErrorProto.findExerpt = errTree.BasicError.prototype.findExerpt;
};
errTree.setDefaultMessageHandler  = function(name, options) {
  errTree.BasicError.prototype.messageHandler =
    errTree.messageHandlers.get(name, options);
};

errTree.useUncaughtExceptionHandler = function() {
  process.on('uncaughtException', function(err) {
    console.log('Uncaught exception:\n|');
    console.log((err.beautifier ? err : err.stack).toString().replace(/^/gm, '|  ') + '\n|');
    process.exit(8);
  });
};
