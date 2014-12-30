'use strict';

var _ = require('lodash');
var chalkGetter = require('color-path').chalkGetter;
var fs = require('fs');

module.exports = function(ctx, options) {
  if (!fs.existsSync(ctx.path))
    return '';

  options = _.defaults(options || {}, {
    exerptBefore: 3,
    exerptAfter: 3,
    colors: true
  });

  var chalk = chalkGetter(options.colors);

  var lines = fs.readFileSync(ctx.path, 'utf8').split(/\r?\n/);

  var start = ctx.line - options.exerptBefore;
  if (start < 1)
    start = 1;
  var end = ctx.line + options.exerptAfter;
  if (end >= lines.length)
    end = lines.length - 1;

  var padSize = ('' + end).length;

  function pad(nb) {
    return ('        ' + nb).slice(-padSize);
  }

  var res = ctx.path + ':' + '\n';
  for (var i = start; i <= end; ++i) {
    if (i !== ctx.line) {
      res += chalk.grey(pad(i) + '. ' + lines[i - 1]) + '\n';
      continue;
    }
    res += chalk.yellow(pad(i) + '. ') +
      lines[i - 1].substr(0, ctx.column - 1) +
      chalk.red.bold(lines[i - 1][ctx.column - 1] || '') +
      lines[i - 1].substr(ctx.column) +
      '\n'
    ;
  }

  return res;
};
