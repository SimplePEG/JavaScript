var rd = require('./rd_parser');

function peg() {
    return rd.action('peg', rd.sequence([
        rd.zero_or_more(_()),
        parsing_header(),
        rd.one_or_more(_()),
        parsing_body(),
        rd.end_of_file()
    ]));
}

function parsing_header() {
    return rd.action('noop',rd.sequence([
        rd.string('GRAMMAR'),
        rd.one_or_more(_()),
        rd.one_or_more(parsing_rule_name())
    ]));
}

function parsing_body() {
    return rd.action('parsing_body', rd.one_or_more(rd.ordered_choice([
        parsing_rule(),
        rd.one_or_more(_())
    ])));
}

function parsing_rule() {
    return rd.action('parsing_rule', rd.sequence([
        parsing_rule_name(),
        rd.zero_or_more(_()),
        rd.string('->'),
        rd.zero_or_more(_()),
        parsing_expression(),
        rd.zero_or_more(_()),
        rd.string(';'),
        rd.zero_or_more(_())
    ]));
}

function parsing_rule_name() {
    return rd.action('noop', rd.sequence([
        rd.regex_char('[a-zA-Z_]'),
        rd.zero_or_more(rd.regex_char('[a-zA-Z0-9_]'))
    ]));
}

function parsing_expression() {
    return rd.action('parsing_expression', rd.ordered_choice([
        parsing_sequence(),
        parsing_ordered_choice(),
        parsing_sub_expression()
    ]));
}

function parsing_sequence() {
    return rd.action('parsing_sequence', rd.sequence([
        rd.ordered_choice([
            parsing_ordered_choice(),
            parsing_sub_expression()
        ]),
        rd.one_or_more(rd.sequence([
            rd.one_or_more(_()),
            rd.ordered_choice([
                parsing_ordered_choice(),
                parsing_sub_expression()
            ])
        ]))
    ]));
}

function parsing_ordered_choice() {
    return rd.action('parsing_ordered_choice', rd.sequence([
        parsing_sub_expression(),
        rd.one_or_more(rd.sequence([
            rd.zero_or_more(_()),
            rd.string('\/'),
            rd.zero_or_more(_()),
            parsing_sub_expression()
        ]))
    ]));
}

function parsing_sub_expression() {
    return rd.action('parsing_sub_expression', rd.ordered_choice([
        parsing_not_predicate(),
        parsing_and_predicate(),
        parsing_optional(),
        parsing_one_or_more(),
        parsing_zero_or_more(),
        parsing_group(),
        parsing_atomic_expression()
    ]));
}

function parsing_group() {
    return rd.action('parsing_group', rd.sequence([
        rd.string('('),
        rd.zero_or_more(_()),
        rd.rec(parsing_expression),
        rd.zero_or_more(_()),
        rd.string(')')
    ]));
}

function parsing_atomic_expression() {
    return rd.action('parsing_atomic_expression', rd.ordered_choice([
        parsing_string(),
        parsing_regex_char(),
        parsing_eof(),
        parsing_rule_call()
    ]));
}

function parsing_not_predicate() {
    return rd.action('parsing_not_predicate', rd.sequence([
        rd.string('!'),
        rd.ordered_choice([
            parsing_group(),
            parsing_atomic_expression()
        ])
    ]));
}

function parsing_and_predicate() {
    return rd.action('parsing_and_predicate', rd.sequence([
        rd.string('&'),
        rd.ordered_choice([
            parsing_group(),
            parsing_atomic_expression()
        ])
    ]));
}

function parsing_zero_or_more() {
    return rd.action('parsing_zero_or_more', rd.sequence([
        rd.ordered_choice([
            parsing_group(),
            parsing_atomic_expression()
        ]),
        rd.string('*')
    ]));
}

function parsing_one_or_more() {
    return rd.action('parsing_one_or_more', rd.sequence([
        rd.ordered_choice([
            parsing_group(),
            parsing_atomic_expression()
        ]),
        rd.string('+')
    ]));
}

function parsing_optional() {
    return rd.action('parsing_optional', rd.sequence([
        rd.ordered_choice([
            parsing_group(),
            parsing_atomic_expression()
        ]),
        rd.string('?')
    ]));
}

function parsing_rule_call() {
    return rd.action('parsing_rule_call', parsing_rule_name())
}

function parsing_string() {
    return rd.action('parsing_string', rd.sequence([
        rd.string('"'),
        rd.one_or_more(rd.ordered_choice([
            rd.string('\\"'),
            rd.regex_char('[^"]')
        ])),
        rd.string('"')
    ]));
}

function parsing_regex_char() {
    return rd.action('parsing_regex_char', rd.ordered_choice([
        rd.sequence([
            rd.string('['),
            rd.optional(rd.string('^')),
            rd.one_or_more(rd.ordered_choice([
                rd.string('\\]'),
                rd.string('\\['),
                rd.regex_char('[^\\]]')
            ])),
            rd.string(']')
        ]),
        rd.string('.')
    ]));
}

function parsing_eof(){
    return rd.action('parsing_end_of_file', rd.string("EOF"))
}

function _() {
    return rd.action('noop', rd.regex_char('[\\s]'))
}

function SPEG_parser() {
    this.parser = peg();
}

SPEG_parser.prototype.parse = function(text) {
    this.state = {
        text: text,
        position: 0
    };
    var ast = this.parser(this.state);
    return ast;
};

SPEG_parser.prototype.getLastExpectations =  function() {
    return this.state.lastExpectations
};

SPEG_parser.prototype.get_last_error = function() {
    return rd.get_last_error(this.state);
};

module.exports = SPEG_parser;
