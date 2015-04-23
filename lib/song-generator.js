/* global define */

define(['underscore', 'lib/parser', 'lib/pattern', 'lib/song'], function (_, parser, pattern, songLib) {

    var Pattern = pattern.Pattern;

    function SongGenerator () {
        var patterns = {};
        var songPatternName;
        var durationConstraints = {};

        function buildPatternFromAST (ast) {
            if ('ref' === ast.type) {
                return buildPatternFromName(ast.value, ast);
            } else {
                var subPatterns = _.map(ast.value, buildPatternFromAST);
                var pat = new Pattern(ast.type, subPatterns);
                pat.sustain = ast.sustain;
                pat.trackName = pat.trackName || ast.trackName;
                return pat;
            }
        }

        function buildPatternFromName (name, node) {
            var pat;

            if (_.has(patterns, name)) {
                pat = buildPatternFromAST(patterns[name]);
            } else {
                // If we don't know this, build it as an atom
                pat = new Pattern('atom', name);
            }

            if (node) {
                pat.sustain = node.sustain;
                pat.trackName = pat.trackName || node.trackName;
            }

            return pat;
        }

        function getSongPatternName () {

            if (!songPatternName) {
                throw new Error('The name of the song pattern is unknown, did you specify it with `@song = SomeName`?');
            }

            return songPatternName;
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
                    } else if ('duration' === item.name) {
                        _.each(item.arguments, function (patternName) {
                            durationConstraints[patternName] = +item.value;
                        });
                    }
                }

                return this;
            },
            addSource: function addSource (source) {
                var that = this;
                _.each(source.split("\n"), function (line) {
                    that.addLine(line);
                });
                return this;
            },
            buildPattern: buildPatternFromName,
            getSongPatternName: getSongPatternName,
            getAtomDuration: function getAtomDuration () {

                if (0 === _.size(durationConstraints)) {
                    throw new Error('Missing @duration directive.');
                }

                var duration = 0;

                var songResolution = buildPatternFromName(getSongPatternName()).flatten().resolution;

                _.each(durationConstraints, function (seconds, patternName) {
                    var pat = buildPatternFromName(patternName);
                    var atomDuration = seconds / pat.duration() * pat.resolution / songResolution;
                    if (0 === duration) {
                        duration = atomDuration;
                    } else if (duration !== atomDuration) {
                        throw new Error(
                            'Conflicting @duration declarations. An atom should last `' + duration +
                            '`, but the constraint on `' + patternName + '` makes it `' + atomDuration + '`'
                        );
                    }
                });

                return duration;
            },
            buildSong: function buildSong () {
                var songPattern = this.buildPattern(
                    this.getSongPatternName()
                );
                return new songLib.Song(songPattern, this.getAtomDuration());
            }
        };
    }

    return {
        SongGenerator: SongGenerator
    };

});
