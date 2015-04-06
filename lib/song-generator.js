/* global define */

define(['underscore', 'lib/parser', 'lib/pattern'], function (_, parser, pattern) {

    var Pattern = pattern.Pattern;

    return function () {
        var patterns = {};
        var builtPatterns = {};

        var atoms = {};
        var songPatternName;

        function buildPatternFromAST (ast) {
            if ('ref' === ast.type) {
                return buildPatternFromName(ast.value);
            } else {
                var subPatterns = _.map(ast.value, buildPatternFromAST);
                return new Pattern(ast.type, subPatterns);
            }
        }

        function buildPatternFromName (name) {
            if (_.has(builtPatterns, name)) {
                // If the pattern was already built, return it
                return builtPatterns[name];
            } else if (_.has(patterns, name)) {
                // The pattern wasn't built, but should be able
                // to make one because we know its name.
                var built = buildPatternFromAST(patterns[name]);
                builtPatterns[name] = built;
                return built;
            } else if (_.has(atoms, name)) {
                // If it's not a pattern, it must be an atom
                return atoms[name];
            } else {
                // If we don't know this, build it as an atom
                atoms[name] = new Pattern('atom', name);
                return atoms[name];
            }
        }

        return {
            addLine: function addLine (line) {
                var item = parser.parseLine(line);
                if ('comment' === item.type) {
                    return this;
                }

                if ('patternDefinition' === item.type) {
                    patterns[item.lhs] = item.rhs;
                }

                if ('directive' === item.type) {
                    if ('song' === item.name) {
                        songPatternName = item.value;
                    }
                }

                return this;
            },
            buildPattern: buildPatternFromName,
            getSongPatternName: function getSongPatternName () {

                if (!songPatternName) {
                    throw new Error('The name of the song pattern is unknown, did you specify it with `@song = SomeName`?');
                }

                return songPatternName;
            }
        };
    };
});
