'use strict';

var _ = require('lodash');
var path = require('path');

module.exports = function parseStack(stack) {
  var lines = stack.split(/\r?\n/);
  var regexp = /\s*at (([^ ]+)(\s+\[as ([^\]]+)\])?\s+\()?([^\[:]+):([\d]+):([\d]+)\)?/;

  return _(lines).map(function(line) {
    var match = line.match(regexp);

    if (!match)
      return false;

    var dirname = path.dirname(match[5]);
    if (dirname === '.')
      dirname = '';
    else
      dirname += '/';
    var shortDirname = dirname.replace(new RegExp('^' + process.cwd() + '/'), '');
    var prefixDirname = shortDirname !== dirname ? process.cwd() + '/': '';

    return {
      fn: match[2],
      as: match[4],
      file: match[5],
      dirname: dirname,
      shortDirname: shortDirname,
      prefixDirname: prefixDirname,
      basename: path.basename(match[5]),
      line: +match[6],
      column: +match[7]
    };
  }).filter().value();
};
