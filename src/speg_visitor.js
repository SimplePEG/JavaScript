function PEGJS_visitor(){}

PEGJS_visitor.visit = function(node) {
    return this[node.type](node);
};
PEGJS_visitor.prototype.string = function(node) {
    return node.match;
};
PEGJS_visitor.prototype.regex_char = function(node) {
    return node.match;
};
PEGJS_visitor.prototype.sequence = function(node) {
    return node.children.map(function(child) { return this.visit(child); });
};
PEGJS_visitor.prototype.ordered_choice = function(node) {
    return node.children.map(function(child) { return this.visit(child); });
};
PEGJS_visitor.prototype.zero_or_more = function(node) {
    return node.children.map(function(child) { return this.visit(child); });
};
PEGJS_visitor.prototype.one_or_more = function(node) {
    return node.children.map(function(child) { return this.visit(child); });
};
PEGJS_visitor.prototype.optional = function(node) {
    return node.children.map(function(child) { return this.visit(child); });
};
PEGJS_visitor.prototype.and_predicate = function(node) {
    return null;
};
PEGJS_visitor.prototype.not_predicate = function(node) {
    return null;
};
PEGJS_visitor.prototype.end_of_file = function(node) {
    return null;
};

function SPEG_actions_visitor(actions) {
    this.actions = actions;
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

module.exports = {
    SPEG_actions_visitor: SPEG_actions_visitor,
    PEGJS_visitor: PEGJS_visitor
};
