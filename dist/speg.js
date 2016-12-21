(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("simplepeg", [], factory);
	else if(typeof exports === 'object')
		exports["simplepeg"] = factory();
	else
		root["simplepeg"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var SPEG_actions_visitor = __webpack_require__(1).SPEG_actions_visitor;
	var SPEG_parser = __webpack_require__(3);
	var rd = __webpack_require__(2);
	var ex = __webpack_require__(4);

	function SPEG() {
	    this.parser = new SPEG_parser();
	    this.visitor = new SPEG_actions_visitor();
	    this.speg_parser = null;
	}

	SPEG.prototype.parse_grammar = function(grammar) {
	    this.speg_parser = null;
	    var speg_ast = this.parser.parse(grammar);
	    if (speg_ast) {
	        this.speg_parser = this.visitor.visit(speg_ast);
	    } else {
	        throw new ex.GrammarParseError('Failed to parse grammar: \n\n' + this.parser.get_last_error());
	    }
	};

	SPEG.prototype.parse_text = function(text) {
	    if (this.speg_parser) {
	        var rules = this.speg_parser.children;
	        var first_rule = rules[0];
	        var first_rule_parser = first_rule.parser;
	        var state = { text: text, position: 0, rules: rules };
	        var ast = first_rule_parser(state);
	        if (ast) {
	            return ast;
	        } else {
	            throw new ex.TextParseError('Failed to parse text: \n\n' + rd.get_last_error(state))
	        }
	    } else {
	        throw Error('You need grammar to parse text. Call parseGrammar first');
	    }
	};

	SPEG.prototype.parse = function(grammar, text) {
	    var speg_ast = this.parser.parse(grammar);
	    if (speg_ast) {
	        var generated_parser = this.visitor.visit(speg_ast);
	        var rules = generated_parser.children;
	        var first_rule = rules[0];
	        var first_rule_parser = first_rule.parser;
	        var state = { text: text, position: 0, rules: rules };
	        var ast = first_rule_parser(state);
	        if (ast) {
	            return ast;
	        } else {
	            throw new ex.TextParseError('Failed to parse text: \n\n' + rd.get_last_error(state))
	        }
	    } else {
	        throw new ex.GrammarParseError('Failed to parse grammar: \n\n' + this.parser.get_last_error())
	    }
	};

	module.exports = {
	    SPEG: SPEG
	};


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var rd = __webpack_require__(2);

	function SPEG_actions_visitor() {
	    this.actions = new SPEG_actions();
	}
	SPEG_actions_visitor.prototype.visit = function(node) {
	    if (node.children) {
	        node.children = node.children.map(function(child){
	            return this.visit(child);
	        }, this);
	    }
	    if (this.actions && node.action) {
	        return this.actions[node.action](node);
	    }
	    return node;
	};

	function SPEG_actions() {}

	SPEG_actions.prototype.noop = function(node) {
	    return node;
	};

	SPEG_actions.prototype.peg = function(node) {
	    return node.children[3];
	};

	SPEG_actions.prototype.parsing_body = function(node) {
	    node.children = node.children.map(function(child){
	        return child.children[0];
	    });
	    return node;
	};

	SPEG_actions.prototype.parsing_rule = function(node) {
	    var rule = node.children[4];
	    return {
	        name: node.children[0].match,
	        parser: rule
	    }
	};

	SPEG_actions.prototype.parsing_expression = function(node) {
	    return node.children[0];
	};

	SPEG_actions.prototype.parsing_sequence = function(node) {
	    var head = [node.children[0].children[0]];
	    var tail = node.children[1].children.map(function(child){
	        return child.children[1].children[0];
	    });
	    return rd.sequence(head.concat(tail));
	};

	SPEG_actions.prototype.parsing_ordered_choice = function(node) {
	    var head = [node.children[0]];
	    var tail = node.children[1].children.map(function(child){
	        return child.children[3];
	    });
	    return rd.ordered_choice(head.concat(tail));
	};

	SPEG_actions.prototype.parsing_sub_expression = function(node) {
	    return function() {
	        var result = node.children[1].children[0].apply(this, arguments);
	        if (result) {
	            var tags = node.children[0].children.map(function(tag_node){
	                return tag_node.children[0].match;
	            });
	            if (tags.length > 0) {
	                if (result.tags) {
	                    result.tags = tags.concat(result.tags);
	                } else {
	                    result.tags = tags;
	                }
	            }
	        }
	        return result;
	    }
	};

	SPEG_actions.prototype.parsing_group = function(node) {
	    return node.children[2];
	};

	SPEG_actions.prototype.parsing_atomic_expression = function(node) {
	    return node.children[0];
	};

	SPEG_actions.prototype.parsing_not_predicate = function(node) {
	    return rd.not_predicate(node.children[1].children[0]);
	};

	SPEG_actions.prototype.parsing_and_predicate = function(node) {
	    return rd.and_predicate(node.children[1].children[0]);
	};

	SPEG_actions.prototype.parsing_zero_or_more = function(node) {
	    return rd.zero_or_more(node.children[0].children[0]);
	};

	SPEG_actions.prototype.parsing_one_or_more = function(node) {
	    return rd.one_or_more(node.children[0].children[0]);
	};

	SPEG_actions.prototype.parsing_optional = function(node) {
	    return rd.optional(node.children[0].children[0]);
	};

	SPEG_actions.prototype.parsing_string = function(node) {
	    return rd.string(node.children[1].match);
	};

	SPEG_actions.prototype.parsing_regex_char = function(node) {
	    return rd.regex_char(node.children[0].match);
	};

	SPEG_actions.prototype.parsing_rule_call = function(node) {
	    return rd.call_rule_by_name(node.match);
	};

	SPEG_actions.prototype.parsing_end_of_file = function() {
	    return rd.end_of_file();
	};

	module.exports = {
	    SPEG_actions_visitor: SPEG_actions_visitor
	};


/***/ },
/* 2 */
/***/ function(module, exports) {

	function get_last_error(state) {
	    if (state.lastExpectations.length < 1) {
	        return false;
	    }
	    var lines = state.text.split('\n');
	    var last_exp_position = state.lastExpectations.reduce(function(a, b){
	        return Math.max(a, b.position);
	    }, state.position);

	    var last_position = 0;
	    var line_of_error = '';
	    var error_line_number;
	    var position_of_error = 0;

	    for (var i = 0; i < lines.length; i++) {
	        var line_lenght = lines[i].length + 1;

	        if (last_exp_position >= last_position &&
	            last_exp_position < (last_position + line_lenght)) {
	            line_of_error = lines[i];
	            position_of_error = last_exp_position - last_position;
	            error_line_number = i + 1;
	            break;
	        }

	        last_position += line_lenght;
	    }

	    var str_error_ln = '' + error_line_number;
	    var error_ln_length = str_error_ln.length;
	    var unexpected_char = 'EOF';
	    if (last_exp_position < state.text.length) {
	        unexpected_char = state.text[last_exp_position];
	    }
	    var unexpected = 'Unexpected "' + unexpected_char + '"';
	    var expected_rules = state.lastExpectations.map(function(exp){ return exp.rule });
	    var expected = ' expected (' + expected_rules.join(' or ') + ')';
	    var pointer = (new Array(position_of_error + 3 + error_ln_length)).join('-') + '^';
	    var extra = line_of_error + '\n' + pointer;
	    return unexpected + expected + '\n' + str_error_ln + ': ' + extra;
	}

	function string(rule) {
	    return function(state) {
	        state.lastExpectations = [];
	        if (state.text.substr(state.position, rule.length) === rule) {
	            var ast = {
	                type: 'string',
	                match: rule,
	                start_position: state.position,
	                end_position: state.position += rule.length
	            };
	            return ast;
	        } else {
	            state.lastExpectations = [{
	                type: 'string',
	                rule: rule,
	                position: state.position
	            }];
	             return false;
	        }
	    }
	}

	function regex_char(rule) {
	     return function(state) {
	        state.lastExpectations = [];
	        var match = state.text.substr(state.position).match(rule);
	        if (match && match.index === 0) {
	            var ast = {
	                type: 'regex_char',
	                match: match[0],
	                start_position: state.position,
	                end_position: state.position += match[0].length
	            };
	            return ast;
	        } else {
	            state.lastExpectations = [{
	                type: 'regex_char',
	                rule: rule,
	                position: state.position
	            }];
	            return false;
	        }
	    }
	}

	function sequence(parsers) {
	    return function(state) {
	        var asts = [];
	        var start_position = state.position;
	        for (var i = 0; i < parsers.length; i++) {
	            var ast = parsers[i](state);
	            if (ast) {
	                asts.push(ast);
	            } else {
	                return false;
	            }
	        }
	        var match = asts.reduce(function(r, n){ return r + (n.match || '') }, '');
	        return {
	            type: 'sequence',
	            match: match,
	            children: asts,
	            start_position: start_position,
	            end_position: state.position
	        };
	    }
	}

	function ordered_choice(parsers) {
	    return function(state) {
	        var expectations = [];
	        var initialState = {
	            text: state.text,
	            position: state.position   
	        };
	        for (var i = 0; i < parsers.length; i++) {
	            var ast = parsers[i](state);
	            if (ast) {
	                return {
	                    type: 'ordered_choice',
	                    match: ast.match,
	                    children: [ast],
	                    start_position: initialState.position,
	                    end_position: state.position
	                };
	            } else {
	                state.text = initialState.text;
	                state.position = initialState.position;
	                expectations = expectations.concat(state.lastExpectations);
	            }
	        }
	        state.lastExpectations = expectations;
	         return false;
	    }
	}

	function zero_or_more(parser) {
	    return function(state) {
	        var ast = true;
	        var asts = [];
	        var start_position = state.position;
	        while (ast) {
	            var state_position = state.position;
	            ast = parser(state);
	            if (ast) {
	                asts.push(ast);
	            } else {
	                state.position = state_position;
	            }
	        }
	        var match = asts.reduce(function(r, n){ return r + (n.match || '') }, '');
	        return {
	            type: 'zero_or_more',
	            match: asts.length > 0 ? match : null,
	            children: asts,
	            start_position: start_position,
	            end_position: state.position
	        }
	    }
	}

	function one_or_more(parser) {
	    return function(state) {
	        var ast = true;
	        var asts = [];
	        var start_position = state.position;
	        while (ast) {
	            var state_position = state.position;
	            ast = parser(state);
	            if (ast) {
	                asts.push(ast);
	            } else {
	                state.position = state_position;
	            }
	        }
	        if (asts.length > 0) {
	            var match = asts.reduce(function(r, n){ return r + (n.match || '') }, '');
	            return {
	                type: 'one_or_more',
	                match: match,
	                children: asts,
	                start_position: start_position,
	                end_position: state.position
	            }
	        } else {
	             return false;
	        }
	    }
	}

	function optional(parser) {
	    return function(state) {
	        var start_position = state.position;
	        var ast = parser(state);
	        var asts = [];
	        if (ast) {
	            asts.push(ast);
	        }
	        var match = asts.reduce(function(r, n){ return r + (n.match || '') }, '');
	        return {
	            type: 'optional',
	            match: asts.length > 0 ? match : null,
	            children: asts.length > 0 ? asts: null,
	            start_position: start_position,
	            end_position: state.position
	        }
	    }
	}

	function and_predicate(parser) {
	    return function(state) {
	        var currentState = {
	            text: state.text,
	            position: state.position   
	        };
	        var ast = parser(state);
	        if (ast) {
	            state.text = currentState.text;
	            state.position = currentState.position;
	            return {
	                type: 'and_predicate',
	                match: null,
	                children: [ast],
	                start_position: state.position,
	                end_position: state.position
	            }
	        } else {
	             return false;
	        }
	    }
	}

	function not_predicate(parser) {
	    return function(state) {
	        var currentState = {
	            text: state.text,
	            position: state.position
	        };
	        var ast = parser(state);
	        if (ast) {
	            state.text = currentState.text;
	            state.position = currentState.position;
	            state.lastExpectations = [{
	                type: 'not_predicate',
	                children: [ast],
	                position: state.position
	            }];
	             return false;
	        } else {
	            state.lastExpectations = [];
	            return {
	                type: 'not_predicate',
	                match: null,
	                children: [],
	                start_position: state.position,
	                end_position: state.position
	            };
	        }
	    }
	}

	function end_of_file() {
	    return function(state) {
	        if (state.text.length === state.position) {
	            return {
	                type: 'end_of_file',
	                match: null,
	                children: [],
	                start_position: state.position,
	                end_position: state.position
	            }
	        } else {
	            state.lastExpectations.push({
	                type: 'end_of_file',
	                rule: 'EOF',
	                position: state.position
	            });
	            return false;
	        }
	    }
	}

	function rec(callback) {
	    return function() {
	        return callback().apply(this, arguments)
	    }
	}

	function action(name, func) {
	    return function(){
	        var ast = func.apply(this, arguments);
	        if (ast) {
	            ast.action = name;
	        }
	        return ast;
	    }
	}

	function call_rule_by_name(name) {
	    return function(state){
	        var rule = state.rules.filter(function(r){
	            return r.name === name;
	        })[0];
	        var ast = rule.parser(state);
	        return ast;
	    }
	}


	module.exports = {
	    get_last_error: get_last_error,
	    string: string,
	    regex_char: regex_char,
	    sequence: sequence,
	    ordered_choice: ordered_choice,
	    zero_or_more: zero_or_more,
	    one_or_more: one_or_more,
	    optional: optional,
	    and_predicate: and_predicate,
	    not_predicate: not_predicate,
	    end_of_file: end_of_file,
	    rec: rec,
	    action: action,
	    call_rule_by_name: call_rule_by_name
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var rd = __webpack_require__(2);

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
	    return rd.action('parsing_sub_expression', rd.sequence([
	        rd.zero_or_more(rd.sequence([
	            tag(),
	            rd.string(':')
	        ])),
	        rd.ordered_choice([
	            parsing_not_predicate(),
	            parsing_and_predicate(),
	            parsing_optional(),
	            parsing_one_or_more(),
	            parsing_zero_or_more(),
	            parsing_group(),
	            parsing_atomic_expression()
	        ])
	    ]));
	}

	function tag() {
	    return rd.action('noop', rd.sequence([
	        rd.regex_char('[a-zA-Z_]'),
	        rd.zero_or_more(rd.regex_char('[a-zA-Z_0-9]'))
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


/***/ },
/* 4 */
/***/ function(module, exports) {

	function GrammarParseError() {
	    var temp = Error.apply(this, arguments);
	    temp.name = this.name = 'GrammarParseError';
	    this.stack = temp.stack;
	    this.message = temp.message;
	}
	GrammarParseError.prototype = Object.create(Error.prototype, {
	    constructor: {
	        value: GrammarParseError,
	        writable: true,
	        configurable: true
	    }
	});

	function TextParseError() {
	    var temp = Error.apply(this, arguments);
	    temp.name = this.name = 'TextParseError';
	    this.stack = temp.stack;
	    this.message = temp.message;
	}
	TextParseError.prototype = Object.create(Error.prototype, {
	    constructor: {
	        value: TextParseError,
	        writable: true,
	        configurable: true
	    }
	});


	module.exports = {
		GrammarParseError: GrammarParseError,
		TextParseError: TextParseError
	}


/***/ }
/******/ ])
});
;