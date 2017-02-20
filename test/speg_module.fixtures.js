var SPEG = require('./../src/speg').SPEG;
var fs = require('fs');
var path = require('path');
var recursiveReadSync = require('recursive-readdir-sync');
var valid_files = recursiveReadSync('./test/speg_fixtures');

describe('speg module - fixtures - ', function() {
    valid_files = valid_files.filter(function(filename) {
        return /\.peg$/.test(filename);
    })
    for (var i = 0, len = valid_files.length; i < len; i++) {
        it('should parse - ' + valid_files[i], (function (filename) {
            return function () {
                var name = path.basename(filename);
                var grammar = fs.readFileSync(filename, "utf8");
                var text = fs.readFileSync(path.join('./test/speg_fixtures/', name + '.txt'), "utf8");
                var result = fs.readFileSync(path.join('./test/speg_fixtures/', name + '.json'), "utf8");
                var speg = new SPEG();
                var module_source = speg.parse_module(grammar);
                fs.writeFileSync('./parser.js', module_source);
                delete require.cache[path.resolve('./parser.js')];
                var parser = new (require('./../parser').SPEG);
                fs.unlinkSync('./parser.js');
                var ast = parser.parse_text(text);
                ast.should.deep.equal(JSON.parse(result));
            }
        }(valid_files[i])));
    }
});
