# JavaScript
[![Build Status](https://travis-ci.org/SimplePEG/JavaScript.svg?branch=master)](https://travis-ci.org/SimplePEG/JavaScript)
[![Coverage Status](https://coveralls.io/repos/github/SimplePEG/JavaScript/badge.svg?branch=master)](https://coveralls.io/github/SimplePEG/JavaScript?branch=master)

JavaScript version ( Browser and Node.js ) of SimplePEG

```
import {SPEG} from 'simplepeg';
const parser = new SPEG();

parser.parse_grammar('GRAMMAR test a->"A";);
const ast = parser.parse_text('A');
console.log(ast);
```