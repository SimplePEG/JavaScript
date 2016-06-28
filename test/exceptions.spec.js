var should = require('chai').should();
var expect = require('chai').expect;
var simplepeg = require('./../src/speg');
var ex = require('./../src/exceptions');

describe('exceptions - ', function() {
    it('should throw correct error when grammar is wrong',function() {
        expect(function() {
            var parser = new simplepeg.SPEG();
            parser.parse_grammar('!!!');
        }).to.throw(ex.GrammarParseError);
    });
    it('should throw correct error when text is wrong',function() {
        expect(function() {
            var parser = new simplepeg.SPEG();
            parser.parse_grammar('GRAMMAR test a -> "A";');
            parser.parse_text('B');
        }).to.throw(ex.TextParseError);
    });
    it('should throw when text called before grammar',function() {
        expect(function() {
            var parser = new simplepeg.SPEG();
            parser.parse_text('B');
        }).to.throw(Error);
    });
    it('should (speg.parse) throw correct error when grammar is wrong',function() {
        expect(function() {
            var parser = new simplepeg.SPEG();
            parser.parse('!!!', 'B');
        }).to.throw(ex.GrammarParseError);
    });
    it('should (speg.parse) throw correct error when text is wrong',function() {
        expect(function() {
            var parser = new simplepeg.SPEG();
            parser.parse('GRAMMAR test a -> "A";', 'B');
        }).to.throw(ex.TextParseError);
    });
});
