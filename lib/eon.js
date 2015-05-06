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

        function char (c) {
            return function parseASpecificChar () {
                if (stream.eat(c)) {
                    return just(c);
                } else {
                    return nothing('Not a `' + c + '`.');
                }
            };
        }

        function string (str) {
            var chars = [];
            for (var i = 0; i < str.length; ++i) {
                chars.push(char(str[i]));
            }
            var parser = sequence.apply(undefined, chars);

            return function () {
                return parser().transform(function (chars) {
                    return chars.join('');
                });
            };
        }

        function not (parser) {
            return function () {
                var oldPos = stream.savePos();
                var got = parser();
                if (got.isJust()) {
                    oldPos.restore();
                    return nothing('Negation matched.');
                } else {
                    return just(stream.get());
                }
            };
        }

        function zeroOrMore (parser) {
            return function () {
                var matches = [];
                var got;
                while ((got = parser()).isJust()) {
                    matches.push(got.getValue());
                }
                return just(matches);
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
            return sequence(parseInt, char('.'), parseInt)().transform(function (parts) {
                return + parts.join('');
            });
        }

        function concatStr (parser) {
            return function () {
                return parser().transform(function (items) {
                    return items.join('');
                });
            };
        }

        function silent (parser) {
            return function () {
                var got = parser();
                if (got.isJust()) {
                    return just(null);
                } else {
                    return got;
                }
            };
        }

        function parseQuotedString () {

            function makeStringParser(quote, escape) {
                return sequence(
                    char(quote),
                        concatStr(
                            zeroOrMore(
                                first(
                                    concatStr(sequence(silent(char(escape)), char(quote))),
                                    not(char(quote))
                                )
                            )
                        ),
                    char(quote)
                );
            }

            var parser = first(
                makeStringParser('"', '\\'),
                makeStringParser("'", '\\')
            );

            return parser().transform(function (match) {
                return match[1];
            });

        }

        var fullParser = first(
            parseBool,
            parseFloat,
            parseInt,
            parseQuotedString
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
