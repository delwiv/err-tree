'use strict';

var glou = require('glou');
var $ = require('./plugins');
var check = require('./check');

var test = module.exports = glou
  .src(['lib/**/*.js'])
  .pipe('istanbul', $.istanbul, {includeUntested: true})
  .pipe($.istanbul.hookRequire)
  .pipe($.swallow)
  .src({read: false}, ['tests/init.js', 'tests/**/*.spec.js'])
  .pipe('mocha', $.mocha, {reporter: 'spec'})
  .pipe($.istanbul.writeReports)
;

glou.task('test', glou.mux(check, test));
glou.task('tests', glou.mux(check, test));
