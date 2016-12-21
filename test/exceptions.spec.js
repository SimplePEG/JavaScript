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
    describe('should (speg.parse) throw correct error when grammar is wrong',function() {
        it(' - wrong beggining', function() {
            expect(function() {
                var parser = new simplepeg.SPEG();
                parser.parse('!!!', 'B');
            }).to.throw(ex.GrammarParseError);
        });
        it(' - forgot semicolon for simple rule', function() {
            expect(function() {
                try {
                    var parser = new simplepeg.SPEG();
                    parser.parse('GRAMMAR t a->b', 'B');
                } catch (e) {
                    expect(e.message).to.equal(
                        'Failed to parse grammar: ' + 
                        '\n\nUnexpected "EOF" expected (; or [\\s])\n' + 
                        '1: GRAMMAR t a->b\n' + 
                        '-----------------^'
                    );
                    throw e;
                }
            }).to.throw(ex.GrammarParseError);
        });
        it(' - forgot semicolon for sequence rule', function() {
            expect(function() {
                try {
                    var parser = new simplepeg.SPEG();
                    parser.parse('GRAMMAR t a->b c', 'B');
                } catch (e) {
                    expect(e.message).to.equal(
                        'Failed to parse grammar: ' + 
                        '\n\nUnexpected "EOF" expected (; or [\\s])\n' + 
                        '1: GRAMMAR t a->b c\n' + 
                        '-------------------^'
                    );
                    throw e;
                }
            }).to.throw(ex.GrammarParseError);
        });
        it(' - forgot semicolon for ordered choice rule', function() {
            expect(function() {
                try {
                    var parser = new simplepeg.SPEG();
                    parser.parse('GRAMMAR t a->b/c', 'B');
                } catch (e) {
                    expect(e.message).to.equal(
                        'Failed to parse grammar: ' + 
                        '\n\nUnexpected "EOF" expected (; or [\\s])\n' + 
                        '1: GRAMMAR t a->b/c\n' + 
                        '-------------------^'
                    );
                    throw e;
                }
            }).to.throw(ex.GrammarParseError);
        });
        it(' - forgot semicolon for second rule', function() {
            expect(function() {
                try {
                    var parser = new simplepeg.SPEG();
                    parser.parse('GRAMMAR t a->b;b->c', 'B');
                } catch (e) {
                    expect(e.message).to.equal(
                        'Failed to parse grammar: ' + 
                        '\n\nUnexpected "EOF" expected (; or [\\s] or EOF)\n' + 
                        '1: GRAMMAR t a->b;b->c\n' + 
                        '----------------------^'
                    );
                    throw e;
                }
            }).to.throw(ex.GrammarParseError);
        });
        it(' - forgot semicolon for third rule', function() {
            expect(function() {
                try {
                    var parser = new simplepeg.SPEG();
                    parser.parse('GRAMMAR t a->b;b->c;c->d', 'B');
                } catch (e) {
                    expect(e.message).to.equal(
                        'Failed to parse grammar: ' + 
                        '\n\nUnexpected "EOF" expected (; or [\\s] or EOF)\n' + 
                        '1: GRAMMAR t a->b;b->c;c->d\n' + 
                        '---------------------------^'
                    );
                    throw e;
                }
            }).to.throw(ex.GrammarParseError);
        });
    });
    it('should (speg.parse) throw correct error when text is wrong',function() {
        expect(function() {
            var parser = new simplepeg.SPEG();
            parser.parse('GRAMMAR test a -> "A";', 'B');
        }).to.throw(ex.TextParseError);
    });
});
