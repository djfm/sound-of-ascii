/**
 * EON: Efficient Object Notation
 */

define([], function () {

    function CharStream (str) {
        var pos = 0;

        this.savePos = function savePos () {

            var oldPos = pos;

            return {
                restore: function restorePos () {
                    if (oldPos === null) {
                        throw new Error('Cannot call restore twice on a saved pos!');
                    }

                    pos = oldPos;
                    oldPos = null;
                }
            };
        };

        this.rest = function rest () {
            return str.substring(pos);
        };

        this.peek = function peek () {
            return str[pos];
        };

        this.get = function get () {
            var c = this.peek();
            this.skip(1);
            return c;
        };

        this.skip = function skip (n) {
            pos += +n || 1;
            return this;
        };

        this.eat = function eat (matcher) {
            if (typeof matcher === 'string') {
                if (this.peek() === matcher[0]) {
                    this.skip();
                    return true;
                }
            }

            return false;
        };

        this.match = function match (matcher) {
            if (matcher instanceof RegExp) {
                var m = matcher.exec(this.rest());
                if (m && m.index === 0) {
                    this.skip(m[0].length);
                    return m;
                }
            }

            return false;
        };
    }


    function parse (input) {
        var stream = new CharStream(input);

        function Maybe (just, data) {
            this.isJust = function isJust () {
                return just;
            };

            this.isNothing = function isNothing () {
                return !this.isJust();
            };

            this.getValue = function getValue () {
                if (!this.isJust()) {
                    throw new Error('Trying to get the value from Nothing.');
                }

                return data;
            };

            this.getError = function getError () {
                if (!this.isNothing()) {
                    throw new Error('Trying to get the error from Just something.');
                }

                return data;
            };

            this.transform = function transform (fn) {
                if (this.isJust()) {
                    data = fn(data);
                }

                return this;
            };
        }

        function just (value) {
            return new Maybe(true, value);
        }

        function nothing (message) {
            return new Maybe(false, message);
        }

        function first (/* parsers */) {
            var parsers = arguments;
            return function returnFirstMatch () {
                for (var i = 0, len = parsers.length; i < len; ++i) {
                    var parser = parsers[i];
                    var got = parser();
                    if (got.isJust()) {
                        return got;
                    }
                }
                return nothing('No matching alternative.');
            };
        }

        function sequence (/* parsers */) {
            var parsers = arguments;
            return function parseSequence () {
                var result = [];
                var oldPos = stream.savePos();
                for (var i = 0, len = parsers.length; i < len; ++i) {
                    var parser = parsers[i];
                    var got = parser();
                    if (got.isJust()) {
                        result.push(got.getValue());
                    } else {
                        oldPos.restore();
                        return got;
                    }
                }
                return just(result);
            };
        }

        function parseChar (c) {
            return function parseASpecificChar () {
                if (stream.eat(c)) {
                    return just(c);
                } else {
                    return nothing('Not a `' + c + '`.');
                }
            };
        }

        function parseBool () {
            if (stream.eat('+')) {
                return just(true);
            } else if (stream.eat('-')) {
                return just(false);
            } else {
                return nothing('Not a bool.');
            }
        }

        function parseInt () {
            var res = stream.match(/\d+/);
            if (res) {
                return just(+res);
            }

            return nothing('Not an int.');
        }

        function parseFloat () {
            return sequence(parseInt, parseChar('.'), parseInt)().transform(function (parts) {
                return + parts.join('');
            });
        }

        function parseString () {

            var quotes = "\"'";
            var escape = "\\";

            if (quotes.indexOf(stream.peek()) === -1) {
                return nothing('Not a string.');
            }

            var quote = stream.get();

            var escaping = false;

            var string = '';

            for(;;) {
                var c = stream.get();
                if (c === quote) {
                    if (escaping) {
                        string += quote;
                        escaping = false;
                    } else {
                        break;
                    }
                } else if (c === escape) {
                    escaping = true;
                } else {
                    if (escaping) {
                        string += escape;
                        escaping = false;
                    }
                    string += c;
                }
            }

            return just(string);
        }

        var fullParser = first(
            parseBool,
            parseFloat,
            parseInt,
            parseString
        );

        return fullParser();
    }

    return {
        parse: function eonParse (input) {
            var got = parse(input);
            if (got.isJust()) {
                return got.getValue();
            } else {
                throw new Error(got.getError());
            }
        }
    };
});
