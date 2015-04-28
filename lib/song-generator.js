/* global define */

define(['underscore', 'lib/parser', 'lib/pattern', 'lib/song'], function (_, parser, pattern, songLib) {
    function SongGenerator () {
        var patterns = {};
        var songPatternName;
        var durationConstraints = {};

        function buildPatternFromAST (ast) {
            var pat;

            if ('ref' === ast.type) {
                if (_.has(patterns, ast.value)) {
                    pat = buildPatternFromAST(patterns[ast.value]);
                } else {
                    pat = new pattern.NotePattern(ast.value);
                }
            } else {
                var subPatterns = _.map(ast.value, buildPatternFromAST);

                if (subPatterns.length === 1) {
                    // FIXME dirty return in the middle,
                    // because when there is 1 subPattern our job is
                    // actually already done and we MUST NOT
                    // set the sustain again!
                    return subPatterns[0];
                } else {
                    var Pattern = pattern[ast.type === 'sum' ? 'SumPattern' : 'SeqPattern'];
                    pat = new Pattern(subPatterns.shift(), subPatterns.shift());
                    while (subPatterns.length > 0) {
                        pat = new Pattern(pat, subPatterns.shift());
                    }
                }
            }

            pat.sustain = ast.sustain;
            if (ast.trackName) {
                pat.control.trackName = pat.control.trackName || ast.trackName;
            }

            return pat;
        }

        function buildPatternFromName (name) {

            if (!_.has(patterns, name)) {
                throw new Error('Undefined pattern: ' + name + '.');
            }

            return buildPatternFromAST(patterns[name]);
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

                return songPattern;
                //return new songLib.Song(songPattern, this.getAtomDuration());
            }
        };
    }

    return {
        SongGenerator: SongGenerator
    };

});
