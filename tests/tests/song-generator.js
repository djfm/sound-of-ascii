/* global define, describe, it, beforeEach */

define(['chai', 'lib/song-generator'], function (chai, songGenerator) {

    var generator;

    beforeEach(function () {
        generator = songGenerator();
    });

    describe('The Song Generator', function () {

        it('should build atomic patterns', function () {
            generator.buildPattern('a').flatten().toString().should.equal('[a]');
        });

        it('should understand a quasi-terminal pattern definition like: Am = [a, c, e]', function () {
            generator.addLine('Am = [a, c, e]');
            generator.buildPattern('Am').flatten().toString().should.equal('[a, c, e]');
        });

        it('should understand a more complex pattern definition like: `Am = [a, c, e]` `Twice = Am Am`', function () {
            generator
                .addLine('Am = [a, c, e]')
                .addLine('Twice = Am Am')
            ;
            generator.buildPattern('Twice').flatten().toString().should.equal('[a a, c c, e e]');
        });

        it('should tell me which is the @song pattern when defined', function () {
            generator.addLine('@song = TheSongPattern');
            generator.getSongPatternName().should.equal('TheSongPattern');
        });

        it('should yell if asked which is the @song pattern when undefined', function () {
            chai.expect(generator.getSongPatternName).to.throw();
        });
    });
});
