/* global define, describe, it */

define(['lib/pattern', 'lib/song', 'chai'], function (patternLib, songLib, chai) {

    var Song = songLib.Song;
    var Pattern = patternLib.Pattern;

    describe('A Song', function () {
        it('should accept a pattern and only a pattern as constructor argument', function () {
            new Song(new Pattern('atom', 'c'));
            chai.expect(function () { new Song(); }).to.throw();
        });
    });
});
