/* global define, describe, it, beforeEach */

define(['chai', 'lib/song-generator'], function (chai, songGenerator) {

    var generator;

    beforeEach(function () {
        generator = new songGenerator.SongGenerator();
    });

    describe('The Song Generator', function () {

        it('should build atomic patterns', function () {
            generator.addLine('Am = a');
            generator.buildPattern('Am').toString().should.equal('[a]');
        });

        it('should understand a quasi-terminal pattern definition like: Am = [a, c, e]', function () {
            generator.addLine('Am = [a, c, e]');
            generator.buildPattern('Am').toString().should.equal('[a, c, e]');
        });

        it('should understand sustain (atom case): Am = a ^', function () {
            generator.addLine('Am = a ^');
            generator.buildPattern('Am').toString().should.equal('[a ^]');
        });

        it('should understand repetitions', function () {
            generator.addLine('Am = a*4');
            generator.buildPattern('Am').toString().should.equal('[a a a a]');
        });

        it('should understand sustain (indirect case with chord): `Am = [a, c, e]` `Twice = Am ^`', function () {
            generator.addSource('Am = [a, c, e]\nTwice = Am ^');
            generator.buildPattern('Twice').toString().should.equal('[a ^, c ^, e ^]');
        });

        it('should understand sustain (indirect case with atom): `Am = a` `Twice = Am ^`', function () {
            generator.addSource('Am = a\nTwice = Am ^');
            generator.buildPattern('Twice').toString().should.equal('[a ^]');
        });

        it('should not mess up sustain in sums: Chorus = [a ^, x y z]', function () {
            generator.addSource('Chorus = [a ^, x y z]').buildPattern('Chorus')
                     .toString().should.equal('[a ^ ^ ^ ^ ^, x ^ y ^ z ^]');
        });

        it('should compute resolutions when building sums', function () {
            var pat = generator.addSource('A = [a]\nTwice = A ^').buildPattern('Twice');
            pat.toString().should.equal('[a ^]');
        });

        it('should preserve timing in sequences: Chorus = b [a ^, x y z]', function () {
            generator.addSource('Chorus = b [a ^, x y z]').buildPattern('Chorus')
                     .toString().should.equal('[b ^ ^ a ^ ^ ^ ^ ^, . ^ ^ x ^ y ^ z ^]');
        });

        it('should understand a more complex pattern definition like: `Am = [a, c, e]` `Twice = Am Am`', function () {
            generator
                .addLine('Am = [a, c, e]')
                .addLine('Twice = Am Am')
            ;
            generator.buildPattern('Twice').toString().should.equal('[a a, c c, e e]');
        });

        it('should understand a multiline input', function () {
            generator.addSource('Am = [a, c, e]\nTwice = Am Am');
            generator.buildPattern('Twice').toString().should.equal('[a a, c c, e e]');
        });

        xit('should allow multiple tracks to be defined', function () {
            generator
                .addSource('Am = [a, c, e]')
                .addSource('XX = [:instrument a c e, Am]')
                .addSource('@duration(Am) = 4')
                .addSource('@song = XX')
            ;

            var song = generator.buildSong();
            song.tracks.length.should.equal(2);
            song.tracks[0].name.should.equal('instrument');
        });

        xit('should allow multiple tracks to be defined - track should propagate', function () {
            generator
                .addSource('Am = [a, c, e]')
                .addSource('XX = [Am, :instrument Am]')
                .addSource('@duration(Am) = 4')
                .addSource('@song = XX')
            ;
            var song = generator.buildSong();
            song.tracks.length.should.equal(2);
            song.tracks[1].name.should.equal('instrument');
        });

        it('should tell me which is the @song pattern when defined', function () {
            generator.addLine('@song = TheSongPattern');
            generator.getSongPatternName().should.equal('TheSongPattern');
        });

        it('should yell if asked which is the @song pattern when undefined', function () {
            chai.expect(generator.getSongPatternName).to.throw();
        });

        xit('should deduce the duration of an atom thanks to the @duration directive', function () {
            generator
                .addLine('Am = a b c d')
                .addLine('@duration(Am) = 4')
                .addLine('@song = Am')
            ;
            generator.getAtomDuration().should.equal(1);
        });

        xit('should yell if conflicting durations are declared', function () {
            generator
                .addLine('Am = [a, c, e]')
                .addLine('C = [c, e, g]')
                .addLine('@duration(Am) = 4')
                .addLine('@duration(C) = 2')
            ;
            chai.expect(generator.getAtomDuration).to.throw();
        });

        it('should yell if no duration is declared', function () {
            chai.expect(generator.getAtomDuration).to.throw();
        });
    });
});
