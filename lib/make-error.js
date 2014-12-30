'use strict';

var _ = require('lodash');
var util = require('util');
var minimatch = require('minimatch');

var assert = require('./assert');
var messageHandlers = require('./message-handlers');

var BasicError;

var knownOptions = [
  'defaultCode',
  'defaultNs',
  'selectExerpt',
  'messageHandler',
  'beautifier'
];

function fnMaker(name, code) {
  return (new Function(
    'code',
    'return function ' + name + '() { return code.apply(this, arguments); }'
  ))(code);
}

var ErrorMakerError;

var makeError = module.exports = function(Error, BaseError, options) {
  if (arguments.length === 2 && !_.isFunction(BaseError)) {
    options = BaseError;
    BaseError = null;
  }
  BaseError = BaseError || BasicError;
  options = options || {};

  if (_.isString(Error))
    Error = fnMaker(Error, function() {
      BaseError.apply(this, arguments);
    });
  else if (!_.isFunction(Error))
    throw new ErrorMakerError('Invalid Error parameter: expected a string or a named function');
  else if(!Error.name)
    throw new ErrorMakerError('Invalid Error parameter: expected a named function (an anonymous function was provided)');

  if (BaseError !== BasicError &&
    (!_.isFunction(BaseError) || !BaseError.prototype || !(BaseError.prototype instanceof BasicError)))
    throw new ErrorMakerError('Invalid BaseError parameter: a constructor inheriting from BasicError is expected');

  var unknownOptions = _.difference(_.keys(options), knownOptions);
  if (unknownOptions.length)
    throw new ErrorMakerError('Invalid options parameter: unknown option(s) [' + unknownOptions.join(', ') + '].');

  if (options.selectExerpt) {
    if (_.isNumber(options.selectExerpt)) {
      options.selectExerpt = (function(oldVal) {
        return function(ctx, pos) {
          return ctx.dirname && oldVal === pos;
        };
      })(options.selectExerpt);
    }
    else if (_.isString(options.selectExerpt) || _.isArray(options.selectExerpt)) {
      if (!_.isArray(options.selectExerpt))
        options.selectExerpt = [options.selectExerpt];
      options.selectExerpt = (function(oldVal) {
        return function(ctx) {
          return ctx.dirname && _.all(oldVal, _.partial(minimatch, ctx.path));
        };
      })(options.selectExerpt);
    }
  }

  util.inherits(Error, BaseError);
  _.extend(Error.prototype, options);
  Error.assert = assert.createAssert(Error);

  return Error;
};

BasicError = require('./basic-error');

ErrorMakerError = makeError.ErrorMakerError = makeError('ErrorMakerError', {
  selectExerpt: ['!**/node_modules/**', '!' + __dirname + '/**'],
  messageHandler: messageHandlers.get('default')
});
