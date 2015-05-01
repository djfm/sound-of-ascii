/* global describe, it, define, beforeEach */

define(['underscore', 'chai', 'lib/pattern'], function (_, chai, pattern) {

    describe('A NotePattern', function () {
        it('should be iterated over', function () {
            var pat = new pattern.NotePattern('tralala');
            pat.control.velocity = 42;

            var unitOfTime = 0.25;
            var start = 0;
            var duration = 1;

            pat.getNotes(unitOfTime, start, duration).should.deep.equal([
                [0, 0.25, 'tralala', {velocity: 42}]
            ]);
        });

        it('should have an absolute duration equal to its sustain', function () {
            var pat = new pattern.NotePattern('tralala');
            pat.sustain = 4;
            pat.getAbsoluteDuration().should.equal(4);
        });
    });

    describe('A SeqPattern', function () {
        it('should be iterated over', function () {
            var pat = new pattern.NotePattern('tralala');
            pat.control.velocity = 42;

            var seq = new pattern.SeqPattern(pat, pat);

            var unitOfTime = 0.25;
            var start = 0;
            var duration = 1;

            seq.getNotes(unitOfTime, start, duration).should.deep.equal([
                [0, 0.125, 'tralala', {velocity: 42}],
                [0.125, 0.125, 'tralala', {velocity: 42}]
            ]);
        });

        it('should be iterated over, taking sustain into account', function () {
            var a = new pattern.NotePattern('a');
            var b = new pattern.NotePattern('b');

            a.sustain = 2;
            b.sustain = 1;

            var seq = new pattern.SeqPattern(a, b);

            var unitOfTime = 1;
            var start = 0;
            var duration = 3;

            seq.getNotes(unitOfTime, start, duration).should.deep.equal([
                [0, 2, 'a', {}],
                [2, 1, 'b', {}]
            ]);
        });

        it('should have an absolute duration that is the sum of the duration of its components weighted by the sustain', function () {
            var a = new pattern.NotePattern('a');
            var b = new pattern.NotePattern('b');

            a.sustain = 2;
            b.sustain = 1;

            var seq = new pattern.SeqPattern(a, b);
            seq.sustain = 4;

            seq.getAbsoluteDuration().should.equal(12);
        });
    });

    describe('A SumPattern', function () {
        it('should be iterated over', function () {
            var a = new pattern.NotePattern('a');
            var b = new pattern.NotePattern('b');

            a.sustain = 2;
            b.sustain = 1;

            var seq = new pattern.SumPattern(a, b);

            var unitOfTime = 1;
            var start = 1;
            var duration = 3;

            seq.getNotes(unitOfTime, start, duration).should.deep.equal([
                [1, 3, 'a', {}],
                [1, 3, 'b', {}]
            ]);
        });

        it('should have an absolute duration that is determined by the primary (= first) pattern weighted by the sustain', function () {
            var a = new pattern.NotePattern('a');
            var b = new pattern.NotePattern('b');

            a.sustain = 2;
            b.sustain = 1;

            var seq = new pattern.SumPattern(a, b);
            seq.sustain = 3;

            seq.getAbsoluteDuration().should.equal(6);
        });
    });

    function notes (pat) {
        return pat.getNotes(1, 0, pat.getAbsoluteDuration());
    }

    describe('Any pattern', function () {
        it('should be rendered as a text representation to make debugging easy', function () {

            var c = new pattern.NotePattern('c');
            var g2 = new pattern.NotePattern('g');
            g2.sustain = 2;
            var silence = new pattern.NotePattern('.');
            var e = new pattern.NotePattern('e');

            var cc = new pattern.SeqPattern(c, c);
            var ccg2 = new pattern.SeqPattern(cc, g2);

            var silenceAndE = new pattern.SeqPattern(silence, e);

            var pat = new pattern.SumPattern(ccg2, silenceAndE);

            c.toString().should.equal('[c]');

            notes(cc).should.deep.include.members([
                [0, 1, 'c', {}],
                [1, 1, 'c', {}]
            ]);

            cc.toString().should.equal('[c c]');

            notes(g2).should.deep.include.members([
                [0, 2, 'g', {}]
            ]);

            g2.toString().should.equal('[g ^]');

            notes(ccg2).should.deep.include.members([
                [0, 1, 'c', {}],
                [1, 1, 'c', {}],
                [2, 2, 'g', {}]
            ]);

            ccg2.toString().should.equal('[c c g ^]');

            notes(pat).should.deep.include.members([
                [0, 1, 'c', {}],
                [1, 1, 'c', {}],
                [2, 2, 'g', {}],
                [0, 2, '.', {}],
                [2, 2, 'e', {}]
            ]);

            pat.toString().should.equal('[c c g ^, . ^ e ^]');

            var g2e = new pattern.SumPattern(g2, e);
            g2e.toString().should.equal('[g ^, e ^]');

            var noteThenSum = new pattern.SeqPattern(c, g2e);
            noteThenSum.toString().should.equal('[c g ^, . e ^]');

        });

        it('should adjust relative durations when toString is called so that the representation is correct', function () {
            var a2 = new pattern.NotePattern('a');
            a2.sustain = 2;
            var x = new pattern.NotePattern('x');
            var y = new pattern.NotePattern('y');
            var z = new pattern.NotePattern('z');

            var seq = new pattern.SeqPattern(x, new pattern.SeqPattern(y, z));
            var sum = new pattern.SumPattern(a2, seq);

            sum.toString().should.equal('[a ^ ^ ^ ^ ^, x ^ y ^ z ^]');
        });

        it('should list tracknames', function () {
            var a = new pattern.NotePattern('a');
            a.control.trackName = 'some-track';
            a.listTrackNames().should.deep.equal(['some-track']);
        });

        it('shoud have a default track called "master"', function () {
            var a = new pattern.NotePattern('a');
            a.listTrackNames().should.deep.equal(['master']);
        });
    });
});
