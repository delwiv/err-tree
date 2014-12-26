'use strict';

var _ = require('lodash');

var errTree = module.exports = require('./make-error');

errTree.BasicError = require('./basic-error');
errTree.parseStack = require('./parser');
errTree.fileExerpt = require('./file-exerpt');
errTree.beautifiers = require('./beautifiers');
errTree.messageHandlers = require('./message-handlers');

errTree.setDefaultBeautifier = function(name, options) {
  errTree.BasicError.prototype.beautifier =
    errTree.beautifiers.get(name, options);
};
errTree.setDefaultMessageHandler  = function(name, options) {
  _.defaults(options, {
    on: errTree.BasicError
  });

  options.on.prototype.messageHandler =
    errTree.messageHandlers.get(name, options);

  if (options.on === errTree.BasicError)
    return;
};

errTree.useUncaughtExceptionHandler = function() {
  process.on('uncaughtException', function(err) {
    console.log('Uncaught exception:\n|');
    console.log(err.toString().replace(/^/gm, '|  ') + '\n|');
    process.exit(8);
  });
};
