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
