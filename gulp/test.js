'use strict';

var glou = require('glou');
var $ = require('./plugins');
var check = require('./check');
var argv = require('yargs').argv;

var istanbulStart = glou
  .src(['lib/**/*.js'])
  .pipe('istanbul', $.istanbul, {includeUntested: true})
  .pipe($.istanbul.hookRequire)
  .pipe($.swallow)
;

var istanbulEnd = glou
  .pipe($.istanbul.writeReports)
;

var test = module.exports = glou
  .pipe(function() {
    return argv.coverage ? istanbulStart() : $.noop();
  })
  .src({read: false}, ['tests/init.js', 'tests/**/*.spec.js'])
  .pipe('mocha', $.mocha, {reporter: 'spec'})
  .pipe(function() {
      return argv.coverage ? istanbulEnd() : $.noop();
    })
;

glou.task('test', glou.mux(check, test));
glou.task('tests', glou.mux(check, test));
