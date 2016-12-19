var SPEG_actions_visitor = require('./speg_visitor').SPEG_actions_visitor;
var SPEG_parser = require('./speg_parser');
var rd = require('./rd_parser');
var ex = require('./exceptions');

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
