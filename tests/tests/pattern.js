/* global describe, it, define, beforeEach */

define(['underscore', 'chai', 'lib/pattern'], function (_, chai, pattern) {

    var Pattern = pattern.Pattern;

    var c, e, g, C, CC;

    beforeEach(function () {
        c = new Pattern('atom', 'c');
        e = new Pattern('atom', 'e');
        g = new Pattern('atom', 'g');
        C = new Pattern('sum', c, e, g);
        CC = new Pattern('seq', C, C);
    });

    describe('Pattern construction', function () {
        it('should accept a `sum` kind and child patterns', function () {
            C.kind.should.equal('sum');
            C.children.should.deep.equal([c, e, g]);
        });

        it('should accept a `seq` kind and child patterns', function () {
            CC.kind.should.equal('seq');
            CC.children.should.deep.equal([C, C]);
        });

        it('should reject any other kind', function () {
            chai.expect(function () {
                new Pattern('something', c, e, g);
            }).to.throw();
        });
    });

    describe('Pattern description', function () {
        it('should take duration into account: if c is an atom of duration 2, it is displayed as "c ^"', function () {
            var pat = new Pattern('atom', 'c');
            pat.atomDuration = 2;
            pat.toString().should.equal('c ^');
        });
    });

    describe('Pattern flattening', function () {
        it('should flatten an atom: c => [c]', function () {
            var flat = c.flatten();
            flat.toString().should.equal('[c]');
        });

        it('should turn a trivial sum of atoms into a sum of sequence of atoms: [c, e, g] => [c, e, g]', function () {
            var flat = C.flatten();
            flat.kind.should.equal('sum');
            flat.children.length.should.equal(3);
            _.each(flat.children, function (child) {
                child.kind.should.equal('seq');
            });
            flat.toString().should.equal('[c, e, g]');
        });

        it('[[c, e, g], [c, e, g]] => [c, e, g, c, e, g]', function () {
            var pat = new Pattern('sum', C, C);
            pat.flatten().toString().should.equal('[c, e, g, c, e, g]');
        });

        it('should flatten a seq of sums: [c, e, g] [c, e, g] => [c c, e e, g g]', function () {
            var flat = CC.flatten();
            flat.duration().should.equal(2);
            flat.toString().should.equal('[c c, e e, g g]');
        });

        it('should make summed patterns the same length: [c e g, c] => [c e g, c ^ ^]', function () {
            var flat = new Pattern('sum', new Pattern('seq', c, e, g), c).flatten();
            flat.toString().should.equal('[c e g, c ^ ^]');
            flat.duration().should.equal(3);
        });

        it('should make summed patterns the same length: [c e g, c e g c] => [c ^ ^ ^ e ^ ^ ^ g ^ ^ ^, c ^ ^ e ^ ^ g ^ ^ c ^ ^]', function () {
            var flat = new Pattern(
                'sum',
                new Pattern('seq', c, e, g),
                new Pattern('seq', c, e, g, c)
            ).flatten();
            flat.toString().should.equal('[c ^ ^ ^ e ^ ^ ^ g ^ ^ ^, c ^ ^ e ^ ^ g ^ ^ c ^ ^]');
        });
    });

});
