/* global describe, it, define */

define(['underscore', 'lib/parser'], function (_, parser) {
    describe('The parser', function () {
        it('should parse a comment', function () {
            _.each(['#hello', '  #hello', ' # hello'], function (line) {
                var parsed = parser.parseLine(line);
                parsed.type.should.equal('comment');
                parsed.value.should.equal('hello');
            });
        });

        it('should parse a pattern definition like: Am = [a, c, e]', function () {
            _.each(['Am = [a, c, e]', '  Am=[a, c, e]'], function (line) {
                var parsed = parser.parseLine(line);
                parsed.type.should.equal('patternDefinition');
                parsed.lhs.should.equal('Am');
                parsed.rhs.should.deep.equal({
                    type: 'sum',
                    value: [{
                        type: 'seq',
                        value: [{
                            type: 'atom',
                            value: 'a'
                        }]
                    },{
                        type: 'seq',
                        value: [{
                            type: 'atom',
                            value: 'c'
                        }]
                    },{
                        type: 'seq',
                        value: [{
                            type: 'atom',
                            value: 'e'
                        }]
                    }]
                });
            });
        });

        it('should parse a pattern definition like: Am = a c e', function () {
            var parsed = parser.parseLine('Am = a c e');
            parsed.type.should.equal('patternDefinition');
            parsed.lhs.should.equal('Am');
            parsed.rhs.should.deep.equal({
                type: 'seq',
                value: [{
                    type: 'atom',
                    value: 'a'
                },{
                    type: 'atom',
                    value: 'c'
                },{
                    type: 'atom',
                    value: 'e'
                }]
            });
            parser.unParseLine(parsed).should.equal('Am = a c e');
        });

        var otherExamples = [
            'Am = [a, c e]',
            'SomeSeq = Hello World',
            'Am_Measure = Am ^ Am Am ^ Am Am Am',
            'Part = Am_Measure F_Measure C_Measure G_Measure'
        ];
        _.each(otherExamples, function (example) {
            it('should parse this line: ' + example, function () {
                parser.unParseLine(parser.parseLine(example)).should.equal(example);
            });
        });

    });
});
