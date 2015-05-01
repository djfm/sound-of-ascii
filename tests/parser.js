/* global describe, it, define */

define(['underscore', 'lib/parser'], function (_, parser) {
    describe('The parser', function () {

        it('should just ignore an empty line', function () {
            parser.parseLine('').should.deep.equal({
                type: 'noop'
            });
        });

        it('should parse a comment', function () {
            _.each(['#hello', '  #hello', ' # hello'], function (line) {
                var parsed = parser.parseLine(line);
                parsed.type.should.equal('comment');
                parsed.value.should.equal('hello');
            });
        });

        it('should parse a directive like: @song = Song', function () {
            var parsed = parser.parseLine('@song = Song');
            parsed.type.should.equal('directive');
            parsed.name.should.equal('song');
            parsed.value.should.equal('Song');
        });

        it('should parse a directive with arguments like: @duration(AmMeasure) = 4', function () {
            var parsed = parser.parseLine('@duration(AmMeasure) = 4');
            parsed.type.should.equal('directive');
            parsed.name.should.equal('duration');
            parsed.value.should.equal('4');
            parsed.arguments.should.deep.equal(['AmMeasure']);
        });

        it('should parse a pattern definition like: Am = [a, c, e]', function () {
            _.each(['Am = [a, c, e]', '  Am=[a, c, e]'], function (line) {
                var parsed = parser.parseLine(line);
                parsed.type.should.equal('patternDefinition');
                parsed.lhs.should.equal('Am');
                parsed.rhs.should.deep.equal({
                    type: 'sum',
                    trackName: null,
                    value: [{
                        type: 'seq',
                        trackName: null,
                        value: [{
                            type: 'ref',
                            value: 'a',
                            sustain: 1,
                            trackName: null
                        }],
                        sustain: 1
                    },{
                        type: 'seq',
                        trackName: null,
                        value: [{
                            type: 'ref',
                            value: 'c',
                            sustain: 1,
                            trackName: null
                        }],
                        sustain: 1
                    },{
                        type: 'seq',
                        trackName: null,
                        value: [{
                            type: 'ref',
                            value: 'e',
                            sustain: 1,
                            trackName: null
                        }],
                        sustain: 1
                    }],
                    sustain: 1
                });
            });
        });

        it('should understand the `sustain` special char: Am = a ^', function () {
            var parsed = parser.parseLine('Am = a ^');
            parsed.rhs.value.length.should.equal(1);
            parsed.rhs.value[0].sustain.should.equal(2);
        });

        it('should parse a pattern definition like: Am = a c e', function () {
            var parsed = parser.parseLine('Am = a c e');
            parsed.type.should.equal('patternDefinition');
            parsed.lhs.should.equal('Am');
            parsed.rhs.should.deep.equal({
                type: 'seq',
                trackName: null,
                value: [{
                    type: 'ref',
                    value: 'a',
                    sustain: 1,
                    trackName: null
                },{
                    type: 'ref',
                    value: 'c',
                    sustain: 1,
                    trackName: null
                },{
                    type: 'ref',
                    value: 'e',
                    sustain: 1,
                    trackName: null
                }],
                sustain: 1
            });
            parser.unParseLine(parsed).should.equal('Am = a c e');
        });

        var otherExamples = [
            'Am = [a, c e]',
            'D/F# = [f#, a1, d1]',
            'SomeSeq = Hello World',
            'Am_Measure = Am ^ Am Am ^ Am Am Am',
            'Part = Am_Measure F_Measure C_Measure G_Measure',
            'Tricky = [[a, c] [f, a c] [c, e] [g, b], a c g]'
        ];
        _.each(otherExamples, function (example) {
            it('should parse this line: ' + example, function () {
                parser.unParseLine(parser.parseLine(example)).should.equal(example);
            });
        });

    });
});
