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
