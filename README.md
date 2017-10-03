# JavaScript

[![Join the chat at https://gitter.im/SimplePEG/JavaScript](https://badges.gitter.im/SimplePEG/JavaScript.svg)](https://gitter.im/SimplePEG/JavaScript?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Greenkeeper badge](https://badges.greenkeeper.io/SimplePEG/JavaScript.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/SimplePEG/JavaScript.svg?branch=master)](https://travis-ci.org/SimplePEG/JavaScript)
[![Coverage Status](https://coveralls.io/repos/github/SimplePEG/JavaScript/badge.svg?branch=master)](https://coveralls.io/github/SimplePEG/JavaScript?branch=master)

JavaScript version ( Browser and Node.js ) of SimplePEG. A very simple implementation of [PEG](https://en.wikipedia.org/wiki/Parsing_expression_grammar) parser generator.

```
const simplepeg = require('simplepeg');
const parser = new simplepeg.SPEG();

parser.parse_grammar('GRAMMAR test a->"A";');
const ast = parser.parse_text('A');
console.log(JSON.stringify(ast, null, 4));
```

# Grammar example
url.peg
```
GRAMMAR url

url       ->  scheme "://" host pathname search hash?;
scheme    ->  "http" "s"?;
host      ->  hostname port?;
hostname  ->  segment ("." segment)*;
segment   ->  [a-z0-9-]+;
port      ->  ":" [0-9]+;
pathname  ->  "/" [^ ?]*;
search    ->  ("?" [^ #]*)?;
hash      ->  "#" [^ ]*;
```
