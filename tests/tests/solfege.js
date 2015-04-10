/* global define, describe, it */

define(['underscore', 'lib/solfege'], function (_, solfege) {

    var noteToSemitones = solfege.noteToSemitones;

    describe('Solfege', function () {

        var strAndExpectedSemitones = [
            ['c'    , 0 ],
            ['c0'   , 0 ],
            ['a0'   , 9 ],
            ['c1'   , 12],
            ['c#'   , 1 ],
            ['c+'   , 1 ],
            ['c♯'   , 1 ],
            ['d♭'   , 1 ],
            ['db'   , 1 ],
            ['d-'   , 1 ],
            ['g4'   , 55]
        ];

        _.each(strAndExpectedSemitones, function (strAndExpectedSemitone) {
            var str = strAndExpectedSemitone[0], semitone = strAndExpectedSemitone[1];
            it('`' + str + '` should have semitone `' + semitone + '`', function () {
                noteToSemitones(str).should.equal(semitone);
            });
        });
    });
});
