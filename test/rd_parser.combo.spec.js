var should = require('chai').should();
var rd = require('./../src/rd_parser');

describe('rd - combo - ', function() {
    it('should successfully combine "string" methods with "sequence"',function() {
        // arrange
        var text = 'testsomething';
        var string_to_match = 'testsomething';
        var start_position = 0;
        var children_to_match = [{
            "end_position": 4,
            "match": "test",
            "start_position": 0,
            "type": "string"
        }, {
            "end_position": 13,
            "match": "something",
            "start_position": 4,
            "type": "string"
        }];
        // act
        var parser = rd.sequence([
            rd.string('test'),
            rd.string('something')
        ]);
        var ast = parser({
            text: text,
            position: start_position
        });
        // assert
        should.exist(ast);
        // we need to assert without children
        ast.should.deep.equal({
            match: string_to_match,
            children: children_to_match,
            start_position: start_position,
            end_position: string_to_match.length,
            type: "sequence"
        });
    });
    it('should successfully parse simple math expression',function() {
        // arrange
        var text = '1 + 2';
        var string_to_match = '1 + 2';
        var start_position = 0;
        var children_to_match = [];
        // act
        function space() {
            return rd.regex_char('[\\s]')
        }
        function multiplicative() {
            return rd.string('*')
        }
        function additive() {
            return rd.string('+')
        }
        function factor() {
            return rd.ordered_choice([
                rd.sequence([
                    rd.string('('),
                    rd.rec(exp),
                    rd.string(')')
                ]),
                rd.regex_char('[0-9]')
            ])
        }
        function term(){
            return rd.sequence([
                factor(),
                rd.zero_or_more(rd.sequence([
                    space(),
                    multiplicative(),
                    space(),
                    factor()
                ]))
            ])
        }
        function exp() {
            return rd.sequence([
                term(),
                rd.zero_or_more(rd.sequence([
                    space(),
                    additive(),
                    space(),
                    term()
                ]))
            ])
        }
        function math() {
            return rd.sequence([
                exp(),
                rd.end_of_file()
            ])
        }
        var parser = math();
        var ast = parser({
            text: text,
            position: start_position
        });
        // assert
        should.exist(ast);
        // we need to assert without children
        ast.match.should.equal(string_to_match);
    });
    it('should fail and return to position if ordered_choice failed', function() {
        // arrange
        var text = 'AB';
        var start_position = 0;
        var state = {
            text: text,
            position: start_position
        };
        // act
        var parser = rd.ordered_choice([
            rd.sequence([
                rd.string('A'),
                rd.string('A')
            ]),
            rd.string('B')
        ]);
        var ast = parser(state);
        // assert
        should.exist(ast);
        ast.should.be.a('boolean');
        state.position.should.equal(0);
    });
    it('should successfully combine "regex_char" methods with "sequence"',function() {
        // arrange
        var text = '1D';
        var string_to_match = '1D';
        var start_position = 0;
        var children_to_match = [{
            "end_position": 1,
            "match": "1",
            "start_position": 0,
            "type": "regex_char"
        }, {
            "end_position": 2,
            "match": "D",
            "start_position": 1,
            "type": "regex_char"
        }];
        // act
        var parser = rd.sequence([
            rd.regex_char('[0-9]'),
            rd.regex_char('[A-Z]')
        ]);
        var ast = parser({
            text: text,
            position: start_position
        });
        // assert
        should.exist(ast);
        // we need to assert without children
        ast.should.deep.equal({
            match: string_to_match,
            children: children_to_match,
            start_position: start_position,
            end_position: string_to_match.length,
            type: "sequence"
        });
    });
});
