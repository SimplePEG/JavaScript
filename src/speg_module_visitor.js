var rd = require('./rd_parser');

function SPEG_module_visitor() {
    this.actions = new SPEG_actions();
}
SPEG_module_visitor.prototype.visit = function(node) {
    this.firstRule = null;
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
    var module_source = 
        'var simplepeg = require(\'simplepeg\');\n' +
        'var rd = simplepeg.rd;\n' +
        'function SPEG() {\n' +
        '    this.state = null;\n' +
        '}\n' +
        'SPEG.prototype.parse_text = function(text) {\n' +
        '    this.state = { text: text, position: 0 };\n' +
        '    var ast = ' + this.firstRule + '()(this.state);\n' +
        '    if (ast) {\n' +
        '        return ast;\n' +
        '    } else {\n' +
        '        throw new simplepeg.TextParseError(\'Failed to parse text: \\n\\n\' + rd.get_last_error(this.state))\n' +
        '    }\n' +
        '};\n' +
        'module.exports = {\n' +
        '    SPEG: SPEG\n' +
        '};\n\n' + node.children[3].join('\n');
    
    return module_source;
};

SPEG_actions.prototype.parsing_body = function(node) {
    node.children = node.children.map(function(child){
        return child.children[0];
    });
    return node.children;
};

SPEG_actions.prototype.parsing_rule = function(node) {
    var rule = node.children[4];
    var ruleName = node.children[0].match;
    if (!this.firstRule) {
        this.firstRule = ruleName;
    }
    return 'function ' + ruleName + '() {\n' +
        'return function(state) {\n' +
            'var start = state.position;\n' +
            'var ast = (' + rule + ')(state);\n' +
            'if (ast) {\n' +
                'ast.rule = "' + ruleName + '";\n' +
                'if (!state.succesfullRules) {\n' +
                    'state.succesfullRules = [];\n' +
                '}\n' +
                'state.succesfullRules.push({\n' +
                    'rule: ast.rule,\n' +
                    'match: ast.match,\n' +
                    'start_position: ast.start_position,\n' +
                    'end_position: ast.end_position\n' +
                '});\n' +
            '} else {\n' +
                'if (!state.failedRules) {\n' +
                    'state.failedRules = [];\n' +
                '}\n' +
                'state.failedRules.push({\n' +
                    'rule: "' + ruleName + '",\n' +
                    'start_position: start\n' +
                '});\n' +
            '}\n' +
            'return ast;\n' +
        '}\n' +
    '}';
};

SPEG_actions.prototype.parsing_expression = function(node) {
    return node.children[0];
};

SPEG_actions.prototype.parsing_sequence = function(node) {
    var head = [node.children[0].children[0]];
    var tail = node.children[1].children.map(function(child){
        return child.children[1].children[0];
    });
    return 'rd.sequence([' + head.concat(tail) + '])';
};

SPEG_actions.prototype.parsing_ordered_choice = function(node) {
    var head = [node.children[0]];
    var tail = node.children[1].children.map(function(child){
        return child.children[3];
    });
    return 'rd.ordered_choice([' + head.concat(tail) + '])';
};

SPEG_actions.prototype.parsing_sub_expression = function(node) {
    var parser = node.children[1].children[0];
    var tags = node.children[0].children.map(function(tag_node){
        return tag_node.children[0].match;
    });
    return 'function(state) {\n' +
        'var ast = ' + parser + '.call(this, state);\n' +
        'var tags = [' + tags + '];\n' +
        'if (ast) {\n' +
        '    if (tags.length > 0) {\n' +
        '        if (ast.tags) {\n' +
        '            ast.tags = tags.concat(ast.tags);\n' +
        '        } else {\n' +
        '            ast.tags = tags;\n' +
        '        }\n' +
        '    }\n' +
        '} else {\n' +
        '    if (!state.failedTags) {\n' +
        '        state.failedTags = [];\n' +
        '    }\n' +
        '    state.failedTags.push.apply(state.failedTags, tags);\n' +
        '}\n' +
        'return ast;\n' +
    '}'
};

SPEG_actions.prototype.parsing_group = function(node) {
    return node.children[2];
};

SPEG_actions.prototype.parsing_atomic_expression = function(node) {
    return node.children[0];
};

SPEG_actions.prototype.parsing_not_predicate = function(node) {
    return 'rd.not_predicate(' + node.children[1].children[0] + ')';
};

SPEG_actions.prototype.parsing_and_predicate = function(node) {
    return 'rd.and_predicate(' + node.children[1].children[0] + ')';
};

SPEG_actions.prototype.parsing_zero_or_more = function(node) {
    return 'rd.zero_or_more(' + node.children[0].children[0] + ')';
};

SPEG_actions.prototype.parsing_one_or_more = function(node) {
    return 'rd.one_or_more(' + node.children[0].children[0] + ')';
};

SPEG_actions.prototype.parsing_optional = function(node) {
    return 'rd.optional(' + node.children[0].children[0] + ')';
};

SPEG_actions.prototype.parsing_string = function(node) {
    return 'rd.string("' + node.children[1].match + '")';
};

SPEG_actions.prototype.parsing_regex_char = function(node) {
    return 'rd.regex_char(/' + node.children[0].match + '/)';
};

SPEG_actions.prototype.parsing_rule_call = function(node) {
    return 'rd.rec(' + node.match + ')';
};

SPEG_actions.prototype.parsing_end_of_file = function() {
    return 'rd.end_of_file()';
};

module.exports = {
    SPEG_module_visitor: SPEG_module_visitor
};
