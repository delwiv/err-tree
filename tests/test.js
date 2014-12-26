'use strict';

var path = require('path');
var util = require('util');
var i18next = require('i18next');
var yamlSync = require('i18next.yaml');

var errTree = require('../');

i18next.backend(yamlSync);
i18next.init({
  lng: 'en-US',
  resGetPath: __dirname + '/locales/__lng__/__ns__.yaml',
  ns: {
    namespaces: ['errors']
  }
}, function() {
  errTree.setDefaultBeautifier('complex', {exerptBefore: 15, exerptAfter: 15});
  errTree.setDefaultMessageHandler('i18next', {i18next: i18next});
  errTree.useUncaughtExceptionHandler();

  var TestError = errTree('TestError', {
    defaultNs: 'my:defaultNs',
    defaultCode: 501,
    selectExerpt: '!' + path.resolve(__dirname, '../lib/**')
  });
  var SubTestError = errTree('SubTestError', TestError, {
    defaultNs: 'my:defaultNs',
    defaultCode: 501
  });

  function SubSubTestError() {
    SubTestError.apply(this, arguments);
  }

  errTree(SubSubTestError, SubTestError);

  SubSubTestError.assert(false, 'my:ns', 'awesome', 404, {super: 'test'}, {devSuper: 'devTest'});

  var err = new SubSubTestError('my:ns', 'awesome', 404, {super: 'test'}, {devSuper: 'devTest'});
  console.log(
    err + '\n',
    err instanceof SubTestError,
    err instanceof TestError,
    err instanceof errTree.BasicError,
    err instanceof Error
  );
});
