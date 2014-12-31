'use strict';

var argv = require('yargs')
  .default({type: 'patch'})
  .argv
;

var _ = require('lodash');
var SemVer  = require('semver').SemVer;
var shell = require('shelljs');
var through = require('through2');

var glou = require('glou');
var $ = require('./plugins');
var check = require('./check');
var test = require('./test');

function run(cmd) {
  if (Array.isArray(cmd))
    cmd = cmd.join(' && ');

  var res = shell.exec(cmd);
  return !res.code;
}

var publish = module.exports = glou
  .src('./*.json')
  .dest('.')

  .configure(function() {
    var version = new SemVer(require('./package.json').version);
    if (argv.channel && argv.channel !== version.prerelease[0])
      version.prerelease = [argv.channel, 1];
    else if (argv.type !== 'prerelease')
      version.inc(argv.type);

    if (version.prerelease[0] === 'pre')
      throw new Error('Should not release in the pre channel');

    var res = {
      version: version.format()
    };

    if (argv.type !== 'prerelease') {
      version.inc('patch');
      version.prerelease = ['pre'];
    }
    else
      version.inc('prerelease');

    res.devVersion = version.format();

    return res;
  })

  .pipe('Bump version', $.bump, {version: glou.config('version')})
  .dest('./')

  .pipe(function() {
    var version = this.config('version');
    var files = [];

    return through.obj(function(file, enc, cb) {
      files.push(file);
      return cb();
    }, function(cb) {
      $.log('Commit/tag/push & NPM publish…');

      run([
        'hg addremove',
        'hg commit -m "Release v' + version + '" --no-verify',
        'hg tag "v' + version + '"',
        'hg push',
        'npm publish',
      ]);

      _.each(files, function(file) {
        return this.push(file);
      }, this);
      cb();
    });
  })

  .pipe('Bump dev version', $.bump, {version: glou.config('devVersion')})
  .dest('./')

  .pipe('Commit/push', function() {
    var devVersion = this.config('devVersion');

    return through.obj(function(file, enc, cb) {
      return cb();
    }, function(cb) {
      run([
        'hg addremove',
        'hg commit -m "Bump version to v' + devVersion + '"',
        'hg push',
      ]);

      cb();
    });
  })
;

glou.task('publish', glou.mux(check, test, publish));
