'use strict';

var _ = require('lodash');
var chalk = require('chalk');

function falseChalk(str) {
  return str;
}
_.each(Object.getOwnPropertyNames(chalk), function(name) {
  falseChalk[name] = falseChalk;
});

module.exports = function(colors) {
  if (colors)
    return chalk;
  return falseChalk;
};
