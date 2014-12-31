'use strict';

var glou = require('glou');
var $ = require('./plugins');

var checker = glou
  .pipe('jshint', glou
    .pipe($.jshint, glou.config('jshintrc', '.jshintrc'))
    .pipe($.jshint.reporter, 'jshint-stylish', {verbose: true})
    .pipe($.jshint.reporter, 'fail')
  )
  .pipe('jscs', $.jscs, '.jscsrc')
;

var checkLib = glou
  .src([
    'lib/**/*.js',
    '*.js',
  ])
  .pipe(checker)
;

var checkTests = glou
  .configure({jshintrc: 'tests/.jshintrc'})
  .src([
    'tests/**/*.js',
  ])
  .pipe(checker)
;

var check = module.exports = glou.mux(checkLib, checkTests);

glou.task('check', check);
