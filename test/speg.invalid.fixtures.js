var SPEG = require('./../src/speg').SPEG;
var fs = require('fs');
var expect = require('chai').expect;
var path = require('path');
var recursiveReadSync = require('recursive-readdir-sync');
var valid_files = recursiveReadSync('./test/speg_invalid_fixtures');

describe('speg - invalid fixtures - ', function() {
    valid_files = valid_files.filter(function(filename) {
        return /\.peg$/.test(filename);
    })
    for (var i = 0, len = valid_files.length; i < len; i++) {
        it('should parse - ' + valid_files[i], (function (filename) {
            return function () {
                var name = path.basename(filename);
                var grammar = fs.readFileSync(filename, "utf8");
                var text = fs.readFileSync(path.join('./test/speg_invalid_fixtures/', name + '.txt'), "utf8");
                var result = fs.readFileSync(path.join('./test/speg_invalid_fixtures/', name + '.error'), "utf8");
                var speg = new SPEG();
                expect(function() {
                    var ast = speg.parse(grammar, text);
                }).to.throw(Error);
                try {
                    var ast = speg.parse(grammar, text);
                } catch (e) {
                    e.message.should.equal(result);
                }
            }
        }(valid_files[i])));
    }
});
