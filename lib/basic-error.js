'use strict';

var _ = require('lodash');
var util = require('util');
var parseStack = require('./parser');
var beautifiers = require('./beautifiers');
var messageHandlers = require('./message-handlers');
var fileExerpt = require('./file-exerpt');

var BasicError = module.exports = function BasicError(ns, message, code, data, devData) {
  if (!_.isString(message)) {
    devData = data;
    data = code;
    code = message;
    message = ns;
    ns = null;
  }
  if (arguments.length < 4 && !_.isNumber(code)) {
    devData = data;
    data = code;
    code = null;
  }
  Error.apply(this, arguments);

  this.name = (this.constructor || {}).name || '<unknown error name>';
  this.ns = ns;
  if (!this.ns && this.ns !== '')
    this.ns = this.defaultNs || '';
  this.message = message;
  this.code = code || this.defaultCode || 500;
  this.data = data || {};

  if (process.env.NODE_ENV !== 'production')
    _.merge(this.data, devData || {});

  BasicError.captureStackTrace(this, this.constructor || BasicError);

  this.message = this.messageHandler(this);

  this.parsedStack = parseStack(this.stack);
  this.stack = this.beautifier(this);
}
util.inherits(BasicError, Error);
BasicError.prototype.toString = function() {
  if (!this.stackDone) {
    this.stackDone = true;
    return this.message;
  }
  return this.stack;
};
BasicError.prototype.inspect = function() {
  return this.toString();
};
BasicError.prototype.beautifier = beautifiers.get('default');
BasicError.prototype.messageHandler = messageHandlers.get('default');
BasicError.selectExerpt = function(ctx) {
  return ctx.dirname && minimatch('!node_modules/', ctx.file);
};
BasicError.prototype.getExerpt = function(options) {
  return fileExerpt(
    _.find(this.parsedStack, this.selectExerpt) || this.parsedStack[0],
    options
  ).replace(/^(.)/mg, '|  $1');
};

BasicError.captureStackTrace = Error.captureStackTrace || function(err) {
  err.stack = (new Error()).stack || '';
};
