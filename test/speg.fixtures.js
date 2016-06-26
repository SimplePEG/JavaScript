var SPEG = require('./../src/speg').SPEG;
var fs = require('fs');
var path = require('path');
var recursiveReadSync = require('recursive-readdir-sync');
var valid_files = recursiveReadSync('./test/speg_fixtures/grammar');

describe('speg - fixtures - ', function() {
    for (var i = 0, len = valid_files.length; i < len; i++) {
        it('should parse - ' + valid_files[i], (function (filename) {
            return function () {
                var name = path.basename(filename);
                var grammar = fs.readFileSync(filename, "utf8");
                var text = fs.readFileSync(path.join('./test/speg_fixtures/text', name + '.txt'), "utf8");
                var result = fs.readFileSync(path.join('./test/speg_fixtures/result', name + '.json'), "utf8");
                var speg = new SPEG();
                var ast = speg.parse(grammar, text);
                ast.should.deep.equal(JSON.parse(result));
            }
        }(valid_files[i])));
    }
});
