var should = require('chai').should();
var rd = require('./../src/rd_parser');

describe('rd - peg methods - ', function() {
    it('should export PEG methods', function () {
        rd.string.should.be.a('function');
        rd.regex_char.should.be.a('function');
        rd.sequence.should.be.a('function');
        rd.ordered_choice.should.be.a('function');
        rd.zero_or_more.should.be.a('function');
        rd.one_or_more.should.be.a('function');
        rd.optional.should.be.a('function');
        rd.and_predicate.should.be.a('function');
        rd.not_predicate.should.be.a('function');
    });
    it('should implement "string" method', function() {
        // arrange
        var text = 'test';
        var string_to_match = 'test';
        var start_position = 0;
        var rule = 'test';
        // act
        var parser = rd.string(rule);
        var state = {
            text: text,
            position: start_position,
        }
        var ast = parser(state);
        // assert
        should.exist(ast);
        // we need to assert without children
        state.lastExpectations.should.deep.equal([]);
        ast.should.deep.equal({
            match: string_to_match,
            start_position: start_position,
            end_position: string_to_match.length,
            type: "string"
        });
    });
    it('should correctly handle wrong text for "string" method', function() {
        // arrange
        var text = 'asda';
        var string_to_match = 'test';
        var start_position = 0;
        var rule = 'test';
        // act
        var parser = rd.string(rule);
        var state = {
            text: text,
            position: start_position
        }
        var ast = parser(state);
        // assert
        should.exist(ast);
        ast.should.be.a('boolean');
        // we need to assert without children
        state.lastExpectations.should.deep.equal([{
            rule: rule,
            position: start_position,
            type: "string"
        }]);
    });
    it('should implement "regex_char" method', function() {
        // arrange
        var text = '8';
        var string_to_match = '8';
        var rule = '[0-9]';
        var start_position = 0;
        // act
        var parser = rd.regex_char(rule);
        var state = {
            text: text,
            position: start_position
        };
        var ast = parser(state);
        // assert
        should.exist(ast);
        // we need to assert without children
        state.lastExpectations.should.deep.equal([]);
        ast.should.deep.equal({
            match: string_to_match,
            start_position: start_position,
            end_position: string_to_match.length,
            type: "regex_char"
        });
    });
    it('should correctly handle wrong text for "regex_char" method', function() {
        // arrange
        var text = 'asda';
        var string_to_match = '8';
        var start_position = 0;
        var rule = '[0-9]';
        // act
        var parser = rd.regex_char(rule);
        var state = {
            text: text,
            position: start_position
        };
        var ast = parser(state);
        // assert
        should.exist(ast);
        ast.should.be.a('boolean');
        // we need to assert without children
        state.lastExpectations.should.deep.equal([{
            rule: rule,
            position: start_position,
            type: "regex_char"
        }]);
    });
    it('should implement "sequence" method for string/regex', function() {
        // arrange
        var text = 'test2';
        var string_to_match = 'test2';
        var children_to_match = [
            {
                match: 'test',
                start_position: 0,
                end_position: 4,
                type: 'string'
            },
            {
                match: '2',
                start_position: 4,
                end_position: 5,
                type: 'regex_char'
            }
        ];
        var parsing_expressions = [
            rd.string('test'),
            rd.regex_char('[0-9]')
        ];
        var start_position = 0;
        var end_position = text.length;
        // act
        var parser = rd.sequence(parsing_expressions);
        var state = {
            text: text,
            position: start_position
        };
        var ast = parser(state);
        // assert
        should.exist(ast);
        // we need to assert without children
        state.lastExpectations.should.deep.equal([]);
        ast.should.deep.equal({
            match: string_to_match,
            children: children_to_match,
            start_position: start_position,
            end_position: end_position,
            type: "sequence"
        });
    });
    it('should implement "sequence" method for regex/string', function() {
        // arrange
        var text = '2test';
        var string_to_match = '2test';
        var children_to_match = [
            {
                match: '2',
                start_position: 0,
                end_position: 1,
                type: 'regex_char'
            },
            {
                match: 'test',
                start_position: 1,
                end_position: 5,
                type: 'string'
            }
        ];
        var parsing_expressions = [
            rd.regex_char('[0-9]'),
            rd.string('test')
        ];
        var start_position = 0;
        var end_position = text.length;
        // act
        var parser = rd.sequence(parsing_expressions);
        var state = {
            text: text,
            position: start_position
        };
        var ast = parser(state);
        // assert
        should.exist(ast);
        // we need to assert without children
        state.lastExpectations.should.deep.equal([]);
        ast.should.deep.equal({
            match: string_to_match,
            children: children_to_match,
            start_position: start_position,
            end_position: end_position,
            type: "sequence"
        });
    });
    it('should correctly handle wrong text for "sequence" method for string/regex', function() {
        // arrange
        var text = 'testwrong';
        var string_to_match = 'test2';
        var children_to_match = [
            {
                match: 'test',
                start_position: 0,
                end_position: 4,
                type: 'string'
            },
            {
                match: '2',
                start_position: 4,
                end_position: 5,
                type: 'regex_char'
            }
        ];
        var parsing_expressions = [
            rd.string('test'),
            rd.regex_char('[0-9]')
        ];
        var start_position = 0;
        var end_position = text.length;
        // act
        var parser = rd.sequence(parsing_expressions);
        var state = {
            text: text,
            position: start_position
        };
        var ast = parser(state);
        // assert
        should.exist(ast);
        ast.should.be.a('boolean');
        // we need to assert without children
        state.lastExpectations.should.deep.equal([{
            rule: '[0-9]',
            position: 4,
            type: "regex_char"
        }]);
    });
    it('should correctly handle wrong text for "sequence" method for regex/string', function() {
        // arrange
        var text = 'wrongtest';
        var string_to_match = '2test';
        var children_to_match = [
            {
                match: '2',
                start_position: 0,
                end_position: 1,
                type: 'regex_char'
            },
            {
                match: 'test',
                start_position: 1,
                end_position: 5,
                type: 'string'
            }
        ];
        var parsing_expressions = [
            rd.regex_char('[0-9]'),
            rd.string('test')
        ];
        var start_position = 0;
        var end_position = text.length;
        // act
        var parser = rd.sequence(parsing_expressions);
        var state = {
            text: text,
            position: start_position
        };
        var ast = parser(state);
        // assert
        should.exist(ast);
        ast.should.be.a('boolean');
        // we need to assert without children
        state.lastExpectations.should.deep.equal([{
            rule: '[0-9]',
            position: start_position,
            type: "regex_char"
        }]);
    });
    it('should implement "ordered_choice" method for string', function() {
        // arrange
        var text = '2';
        var string_to_match = '2';
        var children_to_match = [
            {
                match: '2',
                start_position: 0,
                end_position: 1,
                type: 'regex_char'
            }
        ];
        var parsing_expressions = [
            rd.string('test'),
            rd.regex_char('[0-9]')
        ];
        var start_position = 0;
        var end_position = text.length;
        // act
        var parser = rd.ordered_choice(parsing_expressions);
        var state = {
            text: text,
            position: start_position
        };
        var ast = parser(state);
        // assert
        should.exist(ast);
        // we need to assert without children
        state.lastExpectations.should.deep.equal([]);
        ast.should.deep.equal({
            match: string_to_match,
            children: children_to_match,
            start_position: start_position,
            end_position: start_position + end_position,
            type: "ordered_choice"
        });
    });
    it('should correctly handle wrong text for "ordered_choice" method for string', function() {
        // arrange
        var text = 'zzzwrong';
        var string_to_match = '2';
        var children_to_match = [
            {
                match: 'test',
                start_position: 0,
                end_position: 4,
                type: 'string'
            },
            {
                match: '2',
                start_position: 4,
                end_position: 5,
                type: 'regex_char'
            }
        ];
        var parsing_expressions = [
            rd.string('test'),
            rd.regex_char('[0-9]')
        ];
        var start_position = 0;
        var end_position = text.length;
        // act
        var parser = rd.ordered_choice(parsing_expressions);
        var state = {
            text: text,
            position: start_position
        };
        var ast = parser(state);
        // assert
        should.exist(ast);
        ast.should.be.a('boolean');
        // we need to assert without children
        state.lastExpectations.should.deep.equal([{
            rule: 'test',
            position: 0,
            type: 'string'
        },{
            rule: '[0-9]',
            position: 0,
            type: 'regex_char'
        }]);
    });
    it('should implement "zero_or_more" method for string', function() {
        // arrange
        var text = '22';
        var string_to_match = '22';
        var children_to_match = [
            {
                match: '2',
                start_position: 0,
                end_position: 1,
                type: 'regex_char'
            },
            {
                match: '2',
                start_position: 1,
                end_position: 2,
                type: 'regex_char'
            }
        ];
        var parsing_expression = rd.regex_char('[0-9]');
        var start_position = 0;
        var end_position = text.length;
        // act
        var parser = rd.zero_or_more(parsing_expression);
        var state = {
            text: text,
            position: start_position
        };
        var ast = parser(state);
        // assert
        should.exist(ast);
        // we need to assert without children
        state.lastExpectations.should.deep.equal([]);
        ast.should.deep.equal({
            match: string_to_match,
            children: children_to_match,
            start_position: start_position,
            end_position: end_position,
            type: "zero_or_more"
        });
    });
    it('should correctly handle wrong text for "zero_or_more" method for string', function() {
        // arrange
        var text = 'zzzwrong';
        var string_to_match = null;
        var children_to_match = [];
        var parsing_expression = rd.regex_char('[0-9]');
        var start_position = 0;
        var end_position = 0;
        // act
        var parser = rd.zero_or_more(parsing_expression);
        var state = {
            text: text,
            position: start_position
        };
        var ast = parser(state);
        // assert
        should.exist(ast);
        // we need to assert without children
        ast.should.deep.equal({
            match: string_to_match,
            children: children_to_match,
            start_position: start_position,
            end_position: end_position,
            type: "zero_or_more"
        });
    });
    it('should implement "one_or_more" method for string', function() {
        // arrange
        var text = '22';
        var string_to_match = '22';
        var children_to_match = [
            {
                match: '2',
                start_position: 0,
                end_position: 1,
                type: 'regex_char'
            },
            {
                match: '2',
                start_position: 1,
                end_position: 2,
                type: 'regex_char'
            }
        ];
        var parsing_expression = rd.regex_char('[0-9]');
        var start_position = 0;
        var end_position = text.length;
        // act
        var parser = rd.one_or_more(parsing_expression);
        var state = {
            text: text,
            position: start_position
        };
        var ast = parser(state);
        // assert
        should.exist(ast);
        // we need to assert without children
        state.lastExpectations.should.deep.equal([]);
        ast.should.deep.equal({
            match: string_to_match,
            children: children_to_match,
            start_position: start_position,
            end_position: end_position,
            type: "one_or_more"
        });
    });
    it('should correctly handle wrong text for "one_or_more" method for string', function() {
        // arrange
        var text = 'zzzwrong';
        var string_to_match = null;
        var children_to_match = [];
        var parsing_expression = rd.regex_char('[0-9]');
        var start_position = 0;
        var end_position = 0;
        // act
        var parser = rd.one_or_more(parsing_expression);
        var state = {
            text: text,
            position: start_position
        };
        var ast = parser(state);
        // assert
        should.exist(ast);
        ast.should.be.a('boolean');
        // we need to assert without children
        state.lastExpectations.should.deep.equal([{
            rule: '[0-9]',
            position: 0,
            type: 'regex_char'
        }]);
    });
    it('should implement "optional" method for string', function() {
        // arrange
        var text = '22';
        var string_to_match = '2';
        var children_to_match = [
            {
                match: '2',
                start_position: 0,
                end_position: 1,
                type: 'regex_char'
            }
        ];
        var parsing_expression = rd.regex_char('[0-9]');
        var start_position = 0;
        var end_position = 1;
        // act
        var parser = rd.optional(parsing_expression);
        var state = {
            text: text,
            position: start_position
        };
        var ast = parser(state);
        // assert
        should.exist(ast);
        // we need to assert without children
        state.lastExpectations.should.deep.equal([]);
        ast.should.deep.equal({
            match: string_to_match,
            children: children_to_match,
            start_position: start_position,
            end_position: end_position,
            type: "optional"
        });
    });
    it('should correctly handle wrong text for "optional" method for string', function() {
        // arrange
        var text = 'zzzwrong';
        var string_to_match = null;
        var children_to_match = null;
        var parsing_expression = rd.regex_char('[0-9]');
        var start_position = 0;
        var end_position = 0;
        // act
        var parser = rd.optional(parsing_expression);
        var state = {
            text: text,
            position: start_position
        };
        var ast = parser(state);
        // assert
        should.exist(ast);
        // we need to assert without children
        ast.should.deep.equal({
            match: string_to_match,
            children: children_to_match,
            start_position: start_position,
            end_position: end_position,
            type: "optional"
        });
    });
    it('should implement "and_predicate" method for string', function() {
        // arrange
        var text = '22';
        var string_to_match = null;
        var children_to_match = [
            {
                match: '2',
                start_position: 0,
                end_position: 1,
                type: 'regex_char'
            }
        ];
        var parsing_expression = rd.regex_char('[0-9]');
        var start_position = 0;
        var end_position = 0;
        // act
        var parser = rd.and_predicate(parsing_expression);
        var state = {
            text: text,
            position: start_position
        };
        var ast = parser(state);
        // assert
        should.exist(ast);
        // we need to assert without children
        state.lastExpectations.should.deep.equal([]);
        ast.should.deep.equal({
            match: string_to_match,
            children: children_to_match,
            start_position: start_position,
            end_position: end_position,
            type: "and_predicate"
        });
    });
    it('should correctly handle wrong text for "and_predicate" method for string', function() {
        // arrange
        var text = 'zzzwrong';
        var string_to_match = null;
        var children_to_match = [];
        var parsing_expression = rd.regex_char('[0-9]');
        var start_position = 0;
        var end_position = 0;
        // act
        var parser = rd.and_predicate(parsing_expression);
        var state = {
            text: text,
            position: start_position
        };
        var ast = parser(state);
        // assert
        should.exist(ast);
        ast.should.be.a('boolean');
        // we need to assert without children
        state.lastExpectations.should.deep.equal([{
            rule: '[0-9]',
            position: 0,
            type: 'regex_char'
        }]);
    });
    it('should implement "not_predicate" method for string', function() {
        // arrange
        var text = 'z22';
        var string_to_match = null;
        var children_to_match = [];
        var parsing_expression = rd.regex_char('[0-9]');
        var start_position = 0;
        var end_position = 0;
        // act
        var parser = rd.not_predicate(parsing_expression);
        var state = {
            text: text,
            position: start_position
        };
        var ast = parser(state);
        // assert
        should.exist(ast);
        // we need to assert without children
        state.lastExpectations.should.deep.equal([]);
        ast.should.deep.equal({
            match: string_to_match,
            children: children_to_match,
            start_position: start_position,
            end_position: end_position,
            type: "not_predicate"
        });
    });
    it('should correctly handle wrong text for "not_predicate" method for string', function() {
        // arrange
        var text = '222';
        var string_to_match = null;
        var children_to_match = [];
        var parsing_expression = rd.regex_char('[0-9]');
        var start_position = 0;
        var end_position = 0;
        // act
        var parser = rd.not_predicate(parsing_expression);
        var state = {
            text: text,
            position: start_position
        };
        var ast = parser(state);
        // assert
        should.exist(ast);
        ast.should.be.a('boolean');
        // we need to assert without children
        state.lastExpectations.should.deep.equal([{
            type: 'not_predicate',
            position: 0,
            children: [{
                end_position: 1,
                match: "2",
                start_position: 0,
                type: 'regex_char'
            }]
        }]);
    });
});
