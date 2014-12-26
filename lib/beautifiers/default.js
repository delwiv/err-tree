'use strict';

var _ = require('lodash');

function defaultBeautifier(err) {
  return (err.name || 'Error') + ': ' + (err.message || '') + '\n' +
    _.reduce(err.parsedStack, function(acc, ctx, pos) {
      return acc + '    at ' +
        (ctx.fn ? ctx.fn + (ctx.as ? ' [as ' + ctx.as + ']' : '') + ' (' : '') +
        ctx.file + ':' + ctx.line + ':' + ctx.column +
        ((ctx.fn || '') && ')') +
        (pos !== err.parsedStack.length - 1 ? '\n' : '')
      ;
    }, '')
  ;
}

module.exports = function() {
  return defaultBeautifier;
};
