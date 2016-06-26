var SPEG_parser = require('./../src/speg_parser');
var fs = require('fs');
var recursiveReadSync = require('recursive-readdir-sync');
var valid_files = recursiveReadSync('./test/speg_grammar_fixtures/valid');
var invalid_files = recursiveReadSync('./test/speg_grammar_fixtures/invalid');

describe('speg_parser - fixtures - ', function() {
    for (var i = 0, len = valid_files.length; i < len; i++) {
        it('should parse - ' + valid_files[i], (function (filename) {
            return function () {
                var input = fs.readFileSync(filename, "utf8");
                var speg = new SPEG_parser();
                var ast = speg.parse(input);

                if (!ast) {
                    console.log(JSON.stringify(speg.getLastExpectations()));
                    console.log(speg.getLastError());
                }
                ast.should.be.an('object');
            }
        }(valid_files[i])));
    }
    for (var i = 0, len = invalid_files.length; i < len; i++) {
        it('should fail to parse - ' + invalid_files[i], (function (filename) {
            return function () {
                var input = fs.readFileSync(filename, "utf8");
                var speg = new SPEG_parser();
                var ast = speg.parse(input);
                ast.should.equal(false);
            }
        }(invalid_files[i])));
    }
});
