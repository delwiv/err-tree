'use strict';

var path = require('path');

var $ = require('./plugins');
var argv = require('yargs').argv;
var check = require('./check');
var glou = require('glou');
var rimraf = require('rimraf');
var through = require('through2');

var istanbulStart = glou
  .pipe(through.obj, function() {
    rimraf.sync(path.join(__dirname, '../coverage'));
  })
  .src(['lib/**/*.js'])
  .pipe('istanbul', $.istanbul, {includeUntested: true})
  .pipe($.istanbul.hookRequire)
  .pipe($.swallow)
;

var istanbulEnd = glou
  .pipe($.istanbul.writeReports)
;

var test = module.exports = glou
  .pipe(argv.coverage ? istanbulStart : $.noop)
  .src({read: false}, ['test/init.js', 'test/**/*.spec.js'])
  .pipe('mocha', $.mocha, {reporter: 'spec'})
  .pipe(argv.coverage ? istanbulEnd : $.noop)
;

glou.task('test', glou.serie(glou.pipe({error: argv.passCheck ? 'warn' : 'fail'}, check), test));
