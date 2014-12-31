'use strict';

var _ = require('lodash');
var path = require('path');
var glou = require('glou');

_.extend(module.exports, glou.plugins, glou.plugins.loadPlugins({
  lazy: false,
  config: path.resolve(__dirname, '../package.json')
}));
