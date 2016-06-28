var SPEG_actions_visitor = require('./speg_visitor').SPEG_actions_visitor;
var SPEG_parser = require('./speg_parser');
var rd = require('./rd_parser');

function SPEG() {
    this.parser = new SPEG_parser();
    this.visitor = new SPEG_actions_visitor(new SPEG_actions());
    this.speg_parser = null;
}

SPEG.prototype.parse_grammar = function(grammar) {
    this.speg_parser = null;
    var speg_ast = this.parser.parse(grammar);
    if (speg_ast) {
        this.speg_parser = this.visitor.visit(speg_ast);
    } else {
        throw Error('Failed to parse grammar: \n\n' + this.parser.get_last_error());
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
            throw Error('Failed to parse text: \n\n' + rd.get_last_error(state))
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
            throw Error('Failed to parse text: \n\n' + rd.get_last_error(state))
        }
    } else {
        throw Error('Failed to parse grammar: \n\n' + this.parser.get_last_error())
    }
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
    return node.children[0];
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

SPEG_actions.prototype.parsing_end_of_file = function(node) {
    return rd.end_of_file();
};

module.exports = {
    SPEG: SPEG
};
