/* global define, describe, it */

define(['lib/pattern', 'lib/song', 'chai'], function (patternLib, songLib, chai) {

    var Song = songLib.Song;
    var Pattern = patternLib.Pattern;

    describe('A Song', function () {
        it('should accept a pattern and only a pattern as constructor argument', function () {
            new Song(new Pattern('atom', 'c'));
            chai.expect(function () { new Song(); }).to.throw();
        });
        it('should be made of tracks', function () {
            var song = new Song(new Pattern('atom', 'c'));
            song.tracks.length.should.equal(1);
        });
        it('should be made of tracks that contain degrees, that contain slots, that contain notes... phew :)', function () {
            var song = new Song(new Pattern('atom', 'g#4'));
            song.tracks.length.should.equal(1);
            song.tracks[0].degrees[0].slots[0].notes[0].should.include({
                name: 'g#4',
                value: 56,
                freq: 415.36
            });
        });
    });
});
