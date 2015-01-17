'use strict';

var exec = require('child_process').exec;

var argv = require('yargs')
  .default({type: 'patch'})
  .argv
;
var SemVer  = require('semver').SemVer;

var $ = require('./plugins');
var check = require('./check');
var glou = require('glou');
var pkg = require('../package.json');
var test = require('./test');

function run(cmd, cb) {
  if (Array.isArray(cmd))
    cmd = cmd.join(' && ');

  exec(cmd, function(err, stdout, stderr) {
    console.log(stdout);
    console.error(stderr);
    cb(err);
  });
}

var publish = module.exports = glou
  .src('./*.json')

  .configure(function() {
    var version = new SemVer(pkg.version);
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

  .pipe($.sync, function() {
    var version = this.config('version');
    return function(cb) {
      $.log('Commit/tag/push & NPM publish…');

      var cmds = [
        'hg addremove',
        'hg commit -m "Release v' + version + '"',
        'hg tag "v' + version + '"',
        'hg push',
        'npm publish'
      ];

      if (pkg.version === version)
        cmds.splice(0, 2);

      run(cmds, cb);
    };
  })

  .pipe('Bump dev version', $.bump, {version: glou.config('devVersion')})
  .dest('./')

  .pipe($.sync, function() {
    var devVersion = this.config('devVersion');
    return function(cb) {
      $.log('Commit/push dev version…');

      run([
        'hg addremove',
        'hg commit -m "Bump version to v' + devVersion + '"',
        'hg push',
      ], cb);
    };
  })
;

glou.task('publish', glou.serie(check, test, publish));
