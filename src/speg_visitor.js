var rd = require('./rd_parser');

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
    var ruleName = node.children[0].match;
    return {
        name: ruleName,
        parser: function(state) {
            var start = state.position;
            var ast = rule(state);
            if (ast) {
                ast.rule = ruleName;
                if (!state.succesfullRules) {
                    state.succesfullRules = [];
                }
                state.succesfullRules.push({
                    rule: ast.rule,
                    match: ast.match,
                    start_position: ast.start_position,
                    end_position: ast.end_position
                });
            } else {
                if (!state.failedRules) {
                    state.failedRules = [];
                }
                state.failedRules.push({
                    rule: ruleName,
                    start_position: start
                });
            }
            return ast;
        }
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
    return function(state) {
        var result = node.children[1].children[0].call(this, state);
        var tags = node.children[0].children.map(function(tag_node){
            return tag_node.children[0].match;
        });
        if (result) {
            if (tags.length > 0) {
                if (result.tags) {
                    result.tags = tags.concat(result.tags);
                } else {
                    result.tags = tags;
                }
            }
        } else {
            if (!state.failedTags) {
                state.failedTags = [];
            }
            state.failedTags.push.apply(state.failedTags, tags);
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
    return rd.string(node.children[1].match
        .replace(/\\\\/g, '\\')
        .replace(/\\"/g, '"')
    );
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
