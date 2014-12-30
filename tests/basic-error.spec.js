'use strict';

var expect = require('chai').expect;
var BasicError = require('..').BasicError;

describe('errTree.BasicError', function() {
  it('is a function', function() {
    expect(BasicError).to.be.a('Function');
  });

  it('can be called with new', function() {
    function test() {
      return new BasicError();
    }

    expect(test).not.to.throw();
  });

  describe('<1 arg>', function() {
    afterEach(function() {
      BasicError.prototype.defaultCode = 500;
      BasicError.prototype.defaultNs = '';
    });

    it('accepts message only', function() {
      var err = new BasicError('testmessage');
      expect(err).to.have.properties({
        ns: '',
        message: 'testmessage',
        code: 500,
        data: {}
      });
    });

    it('select proper defaults', function() {
      BasicError.prototype.defaultCode = 404;
      BasicError.prototype.defaultNs = 'defaultNsTest';
      var err = new BasicError('testmessage');
      expect(err).to.have.properties({
        ns: 'defaultNsTest',
        message: 'testmessage',
        code: 404,
        data: {}
      });
    })
  });

  describe('<2 args>', function() {
    it('accepts 1st argument namespace', function() {
      var err = new BasicError('testns', 'testmessage');
      expect(err).to.have.properties({
        ns: 'testns',
        message: 'testmessage',
        code: 500,
        data: {}
      });
    });

    it('accepts 2nd argument code', function() {
      var err = new BasicError('testmessage', 404);
      expect(err).to.have.properties({
        ns: '',
        message: 'testmessage',
        code: 404,
        data: {}
      });
    });

    it('accepts 2nd argument data', function() {
      var err = new BasicError('testmessage', {test: 'foo'});
      expect(err).to.have.properties({
        ns: '',
        message: 'testmessage',
        code: 500,
        data: {test: 'foo'}
      })
    });
  });

  describe('<3 args>', function() {
    it('accepts 1st argument namespace & 3rd code', function() {
      var err = new BasicError('testns', 'testmessage', 404);
      expect(err).to.have.properties({
        ns: 'testns',
        message: 'testmessage',
        code: 404,
        data: {}
      });
    });

    it('accepts 1st argument namespace & 3rd data', function() {
      var err = new BasicError('testns', 'testmessage', {test: 'foo'});
      expect(err).to.have.properties({
        ns: 'testns',
        message: 'testmessage',
        code: 500,
        data: {test: 'foo'}
      });
    });

    it('accepts 2nd argument code & 3rd data', function() {
      var err = new BasicError('testmessage', 404, {test: 'foo'});
      expect(err).to.have.properties({
        ns: '',
        message: 'testmessage',
        code: 404,
        data: {test: 'foo'}
      });
    });

    it('accepts 2nd argument data & 3rd devdata', function() {
      var err = new BasicError('testmessage', {test: 'foo'}, {devtest: 'bar'});
      expect(err).to.have.properties({
        ns: '',
        message: 'testmessage',
        code: 500,
        data: {test: 'foo', devtest: 'bar'}
      });
    });
  });

  describe('<4 args>', function() {
    it('accepts 1st argument namespace & no dev data', function() {
      var err = new BasicError('testns', 'testmessage', 404, {test: 'foo'});
      expect(err).to.have.properties({
        ns: 'testns',
        message: 'testmessage',
        code: 404,
        data: {test: 'foo'}
      });
    });

    it('accepts 1st message up to devdata', function() {
      var err = new BasicError('testmessage', 404, {test: 'foo'}, {devtest: 'bar'});
      expect(err).to.have.properties({
        ns: '',
        message: 'testmessage',
        code: 404,
        data: {test: 'foo', devtest: 'bar'}
      });
    });
  });

  describe('<5 args>', function() {
    afterEach(function() {
      process.env.NODE_ENV = 'test';
    });

    it('accepts all arguments together', function() {
      var err = new BasicError('testns', 'testmessage', 404, {test: 'foo'}, {devtest: 'bar'});
      expect(err).to.have.properties({
        ns: 'testns',
        message: 'testmessage',
        code: 404,
        data: {test: 'foo', devtest: 'bar'}
      });
    });

    it('ignores devdata in production', function() {
      process.env.NODE_ENV = 'production';
      var err = new BasicError('testns', 'testmessage', 404, {test: 'foo'}, {devtest: 'bar'});
      expect(err).to.have.property('data').that.has.not.a.property('devtest');
    });
  });

  describe('#instance', function() {
    var inst = new BasicError('message');

    it('is an instance of BasicError', function() {
      expect(inst).to.be.an.instanceOf(BasicError);
    });

    it('is an instance of Error', function() {
      expect(inst).to.be.an.instanceOf(Error);
    });

    describe('.toString()', function() {
      it('is a function different from Error', function() {
        expect(inst)
          .to.have.property('toString')
          .that.is.a('Function')
          .and.that.is.not.equal(Error.prototype.toString)
        ;
      });

      it('return a string equal to err.stack', function() {
        expect(inst.toString()).to.be.a('String').that.is.equal(inst.stack);
      });
    });

    describe('.beautifier()', function() {
      it('is a function', function() {
        expect(inst)
          .to.have.property('beautifier')
          .that.is.a('Function')
        ;
      });

      it('return a string equal to err.stack', function() {
        expect(inst.beautifier(inst)).to.be.a('String').that.is.equal(inst.stack);
      });
    });

    describe('.messageHandler()', function() {
      it('is a function', function() {
        expect(inst)
          .to.have.property('messageHandler')
          .that.is.a('Function')
        ;
      });

      it('return a string equal to err.message', function() {
        expect(inst.messageHandler(inst)).to.be.equal('message');
      });
    });

    describe('.selectExerpt()', function() {
      it('is a function', function() {
        expect(inst)
          .to.have.property('selectExerpt')
          .that.is.a('Function')
        ;
      });

      it('returns falsy if provided argument does not contain a dirname', function() {
        expect(inst.selectExerpt({})).to.be.not.ok();
      });

      it('returns falsy if provided argument contains a dirname with node_modules/ in it', function() {
        expect(inst.selectExerpt({dirname: 'tests/node_modules/tests'})).to.be.not.ok();
      });

      it('returns true otherwise', function() {
        expect(inst.selectExerpt({dirname: 'ok/'})).to.be.true();
      });
    });

    describe('.getExerpt()', function() {
      it('is a function', function() {
        expect(inst)
          .to.have.property('getExerpt')
          .that.is.a('Function')
        ;
      });

      it('return a string containing the current filename', function() {
        expect(inst.getExerpt()).to.be.a('String').that.contain(__filename);
      });

      it('pass options down to file exerpt', function() {
        var res1 = inst.getExerpt();
        var res2 = inst.getExerpt({colors: false});
        expect(res1).not.to.be.equal(res2);
      });
    });
  });
});
